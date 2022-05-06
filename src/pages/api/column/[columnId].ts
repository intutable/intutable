import {
    ViewDescriptor,
    ViewInfo,
    ColumnInfo,
    changeColumnAttributes,
    getColumnInfo,
    getViewInfo,
    removeColumnFromView,
    removeJoinFromView,
} from "@intutable/lazy-views"
import { removeColumn } from "@intutable/project-management/dist/requests"
import { coreRequest, Parser } from "api/utils"
import type { NextApiRequest, NextApiResponse } from "next"
import { Column } from "types"
import { makeError } from "utils/error-handling/utils/makeError"
import { withSessionRoute } from "auth"
import { withUserCheck } from "utils/withUserCheck"
import { IsTakenError } from "utils/error-handling/custom/IsTakenError"

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
            update: Column.Serialized
        }
        const user = req.session.user!

        const deparsedUpdate = Parser.Column.deparse(update, columnId)

        // check for naming conflicts
        if ("name" in deparsedUpdate.attributes) {
            const nameUpdate = (deparsedUpdate.attributes as { name: string })
                .name

            // TODO: check if the name is taken
            throw new Error("NOT IMPLEMENTED")

            const isTakenError = new IsTakenError()
            res.status(500).send(isTakenError.serialize())
        }

        // change property in view column, underlying table column is never used
        const updatedColumn = await coreRequest<ColumnInfo>(
            changeColumnAttributes(columnId, deparsedUpdate.attributes),
            user.authCookie
        )

        res.status(200).json(updatedColumn)
    } catch (err) {
        const error = makeError(err)
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
        const { viewId } = req.body as { viewId: ViewDescriptor["id"] }
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
                getViewInfo(viewId),
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
