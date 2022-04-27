import {
    ViewOptions,
    ViewDescriptor,
    ViewData,
    deleteView,
    getViewData,
    getViewOptions,
    renameView,
    asTable,
} from "@intutable/lazy-views"
import { removeTable } from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { Table } from "api/utils/parse"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { inspect } from "util"
import { makeError } from "utils/makeError"
import { replaceUndefined } from "utils/replaceUndefined"
import { withUserCheck } from "utils/withUserCheck"

/**
 * GET a single table view's data {@type {TableData.Serialized}}.
 *
 * @tutorial
 * ```
 * - URL: `/api/table/[id]` e.g. `/api/table/1`
 * - Body: {}
 * ```
 */
const GET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    tableId: ViewDescriptor["id"]
) => {
    try {
        const user = req.session.user!
        const tableData = await coreRequest<ViewData>(
            getViewData(tableId),
            user.authCookie
        )

        // parse it
        const parsedTableData = Table.parse(tableData)
        // const replacedUndefineds = replaceUndefined(parsedTableData)

        console.log(replaceUndefined)

        res.status(200).json(parsedTableData)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

/**
 * PATCH/update the name of a single table.
 * Returns the updated table view {@type {ViewDescriptor}}.

 * @tutorial
 * ```
 * - URL: `/api/project/[id]` e.g. `/api/project/1`
 * - Body: {
 *    newName: {@type {string}}
 * }
 * ```
 */
const PATCH = async (
    req: NextApiRequest,
    res: NextApiResponse,
    tableId: ViewDescriptor["id"]
) => {
    try {
        const { newName } = req.body as {
            newName: ViewDescriptor["name"]
        }
        const user = req.session.user!

        // rename only view, underlying table's name does not matter.
        const updatedTable = await coreRequest<ViewDescriptor>(
            renameView(tableId, newName),
            user.authCookie
        )

        res.status(200).json(updatedTable)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE a table. Returns an empty object.
 *
 * @tutorial
 * ```
 * - URL: `/api/table/[id]` e.g. `/api/table/1`
 * - Body: {}
 * ```
 */
const DELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    tableId: ViewDescriptor["id"]
) => {
    try {
        const user = req.session.user!
        // delete table in project-management
        const options = await coreRequest<ViewOptions>(
            getViewOptions(tableId),
            user.authCookie
        )
        await coreRequest(
            removeTable(asTable(options.source).id),
            user.authCookie
        )

        // delete table in lazy-views
        await coreRequest(deleteView(tableId), user.authCookie)

        res.status(200).send({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default withSessionRoute(
    withUserCheck(async (req: NextApiRequest, res: NextApiResponse) => {
        const { query, method } = req
        const tableId = parseInt(query.tableId as string)

        switch (method) {
            case "GET":
                await GET(req, res, tableId)
                break
            case "PATCH":
                await PATCH(req, res, tableId)
                break
            case "DELETE":
                await DELETE(req, res, tableId)
                break
            default:
                res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    })
)
