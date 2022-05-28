import {
    changeColumnAttributes,
    ColumnInfo,
    getColumnInfo,
    getViewInfo,
    removeColumnFromView,
    removeJoinFromView,
    ViewDescriptor,
    ViewInfo,
} from "@intutable/lazy-views"
import { removeColumn } from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/error-handling/utils/makeError"
import { withUserCheck } from "utils/withUserCheck"
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
const PATCH = async (
    req: NextApiRequest,
    res: NextApiResponse,
    columnId: ColumnInfo["id"]
) => {
    try {
        const { update } = req.body as {
            update: Record<string, unknown>
        }
        const user = req.session.user!

        console.log("Well? " + JSON.stringify(update))
        // TODO: check if the name is already taken

        // change property in view column, underlying table column is never used
        const updatedColumn = await coreRequest<ColumnInfo>(
            changeColumnAttributes(columnId, objToSql(update)),
            user.authCookie
        )

        res.status(200).json(updatedColumn)
    } catch (err) {
        const error = makeError(err)
        console.log(error.toString())
        res.status(500).json({ error: error.message })
    }
}

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
const DELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    columnId: ColumnInfo["id"]
) => {
    try {
        const { tableViewId } = req.body as {
            tableViewId: ViewDescriptor["id"]
        }
        const user = req.session.user!

        const column = await coreRequest<ColumnInfo>(
            getColumnInfo(columnId),
            user.authCookie
        )

        if (column.attributes.userPrimary)
            // cannot delete the primary column
            throw Error("deleteUserPrimary")

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

        res.status(200).send({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default withSessionRoute(
    withUserCheck(async (req: NextApiRequest, res: NextApiResponse) => {
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
