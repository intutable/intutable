import {
    changeColumnAttributes,
    ColumnInfo,
    getViewInfo,
    listViews,
    viewId,
    removeColumnFromView,
    removeJoinFromView,
    ViewDescriptor,
    ViewInfo,
} from "@intutable/lazy-views"
import { removeColumn } from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withSessionRoute } from "auth"
import { withUserCheck } from "api/utils/withUserCheck"
import { objToSql } from "utils/objToSql"

/**
 * Update the metadata of a column. Only its `attributes` can be changed, all
 * other properties are directly necessary to functionality and must not be
 * messed with.
 * @tutorial
 * ```
 * URL : `/api/column/[id]`, e.g. `/api/column/32`
 * - Body: {
 *    user: {@type {User}}
 *    projectId: {@type {number}}
 *    name: {@type {string}}
 * }
 * ```
 */
const PATCH = withCatchingAPIRoute(
    async (req, res, columnId: ColumnInfo["id"]) => {
        const { update } = req.body as {
            update: Record<string, unknown>
        }
        const user = req.session.user!

        // TODO: check if the name is already taken

        // change property in view column, underlying table column is never used
        const updatedColumn = await coreRequest<ColumnInfo>(
            changeColumnAttributes(columnId, objToSql(update)),
            user.authCookie
        )

        res.status(200).json(updatedColumn)
    }
)

/**
 * Delete a column.
 * @tutorial
 * ```
 * URL : `/api/column/[id]`, e.g. `/api/column/32`
 * - Body: {
 *    viewId: {@type {number}}
 * }
 * ```
 */
const DELETE = withCatchingAPIRoute(
    async (req, res, columnId: ColumnInfo["id"]) => {
        const { tableViewId } = req.body as {
            tableViewId: ViewDescriptor["id"]
        }
        const user = req.session.user!

        const tableView = await coreRequest<ViewInfo>(
            getViewInfo(tableViewId),
            user.authCookie
        )
        const column = tableView.columns.find(c => c.id === columnId)

        if (!column) throw Error("columnNotFound")
        if (column.attributes.userPrimary)
            // cannot delete the primary column
            throw Error("deleteUserPrimary")

        // delete column in all filter views:
        const filterViews = await coreRequest<ViewDescriptor[]>(
            listViews(viewId(tableViewId)),
            user.authCookie
        )
        await Promise.all(
            filterViews.map(async v => {
                const info = await coreRequest<ViewInfo>(
                    getViewInfo(v.id),
                    user.authCookie
                )
                // technically, it's possible that there are multiple columns
                // with the same parent column, but there can only be one per join,
                // and filter views never have joins.
                const viewColumn = info.columns.find(
                    c => c.parentColumnId === column.id
                )
                if (viewColumn)
                    await coreRequest(
                        removeColumnFromView(viewColumn.id),
                        user.authCookie
                    )
            })
        )

        // delete column in table view:
        await coreRequest(removeColumnFromView(columnId), user.authCookie)
        if (column.joinId === null)
            // if column belongs to base table, delete underlying table column
            await coreRequest(
                removeColumn(column.parentColumnId),
                user.authCookie
            )
        else if (column.attributes.formatter === "linkColumn") {
            // if column is a link column, we need to do some more work:
            const info = await coreRequest<ViewInfo>(
                getViewInfo(tableViewId),
                user.authCookie
            )
            // delete foreign key column
            const join = info.joins.find(j => j.id === column.joinId)!
            const fkColumnId = join.on[0]
            await coreRequest(removeColumn(fkColumnId), user.authCookie)
            await coreRequest(
                removeJoinFromView(column.joinId),
                user.authCookie
            )
        }

        res.status(200).json({})
    }
)

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        const { query, method } = req
        const columnId = parseInt(query.columnId as string)

        switch (method) {
            case "PATCH":
                await PATCH(req, res, columnId)
                break
            case "DELETE":
                await DELETE(req, res, columnId)
                break
            default:
                res.setHeader("Allow", ["PATCH", "DELETE"])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    })
)
