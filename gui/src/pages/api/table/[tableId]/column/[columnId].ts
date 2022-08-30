import {
    changeColumnAttributes,
    ColumnInfo,
    getColumnInfo,
    getViewInfo,
    listViews,
    viewId,
    ViewDescriptor,
    ViewInfo,
} from "@intutable/lazy-views"

import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withSessionRoute } from "auth"
import { withUserCheck } from "api/utils/withUserCheck"
import { objToSql } from "utils/objToSql"

import { removeColumnFromTable } from "dekanat-app-plugin/dist/requests"

/**
 * Update the metadata of a column. Only its `attributes` can be changed, all
 * other properties are directly necessary to functionality and must not be
 * messed with.
 * @tutorial
 * ```
 * URL : `/api/table/[tableId]/column/[columnId]`, e.g.
 * `/api/table/5/column/32`
 * - Body: {
 *     update: Record<string, unknown>
 * }
 * ```
 */
const PATCH = withCatchingAPIRoute(
    async (
        req,
        res,
        tableId: ViewDescriptor["id"],
        columnId: ColumnInfo["id"]
    ) => {
        const { update, cascade } = req.body as {
            update: Record<string, unknown>
            cascade?: boolean
        }
        const cascade_ = typeof cascade === "boolean" ? cascade : true

        const user = req.session.user!

        const tableInfo = await coreRequest<ViewInfo>(
            getViewInfo(tableId),
            user.authCookie
        )

        // check if the name is already taken
        if (
            update["displayName"] !== undefined &&
            tableInfo.columns.some(
                c => c.attributes.displayName === update.displayName
            )
        )
            throw Error("alreadyTaken")

        // change property in table column
        const updatedColumn = await coreRequest<ColumnInfo>(
            changeColumnAttributes(columnId, objToSql(update)),
            user.authCookie
        )

        if (cascade_) {
            // change property in view columns
            const filterViews = await coreRequest<ViewDescriptor[]>(
                listViews(viewId(tableId)),
                user.authCookie
            )
            await Promise.all(
                filterViews.map(async v => {
                    const viewInfo = await coreRequest<ViewInfo>(
                        getViewInfo(v.id),
                        user.authCookie
                    )
                    // we don't want to be accidentally renaming links or lookups.
                    const theColumn = viewInfo.columns.find(
                        c => c.parentColumnId === columnId && c.joinId === null
                    )
                    if (theColumn !== undefined)
                        await coreRequest<ColumnInfo>(
                            changeColumnAttributes(
                                theColumn.id,
                                objToSql(update)
                            ),
                            user.authCookie
                        )
                })
            )
        }

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
    async (
        req,
        res,
        tableId: ViewDescriptor["id"],
        columnId: ColumnInfo["id"]
    ) => {
        const user = req.session.user!

        const column = await coreRequest<ColumnInfo>(
            getColumnInfo(columnId),
            user.authCookie
        )

        if (!column) throw Error("columnNotFound")
        if (column.attributes.userPrimary)
            // cannot delete the primary column
            throw Error("deleteUserPrimary")

        await coreRequest(
            removeColumnFromTable(tableId, columnId),
            user.authCookie
        )

        res.status(200).json({})
    }
)

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        const { query, method } = req
        const tableId = parseInt(query.tableId as string)
        const columnId = parseInt(query.columnId as string)

        switch (method) {
            case "PATCH":
                await PATCH(req, res, tableId, columnId)
                break
            case "DELETE":
                await DELETE(req, res, tableId, columnId)
                break
            default:
                res.setHeader("Allow", ["PATCH", "DELETE"])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    })
)
