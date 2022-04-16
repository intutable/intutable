import {
    deleteJt,
    getJtData,
    getJtOptions,
    renameJt,
} from "@intutable/join-tables/dist/requests"
import {
    JtData,
    JtDescriptor,
    JtOptions,
} from "@intutable/join-tables/dist/types"
import { removeTable } from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"
import { withUserCheck } from "utils/withUserCheck"

/**
 * GET a single (join) table's data {@type {JtData}}.
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
    tableId: JtDescriptor["id"]
) => {
    try {
        const user = req.session.user!
        const tableData = await coreRequest<JtData>(
            getJtData(tableId),
            user.authCookie
        )

        res.status(200).json(tableData)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

/**
 * PATCH/update the name of a single table.
 * Returns the updated join table {@type {JtDescriptor}}.

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
    tableId: JtDescriptor["id"]
) => {
    try {
        const { newName } = req.body as {
            newName: JtDescriptor["name"]
        }
        const user = req.session.user!

        // rename table in join-tables
        const updatedTable = await coreRequest<JtDescriptor>(
            renameJt(tableId, newName),
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
    tableId: JtDescriptor["id"]
) => {
    try {
        const user = req.session.user!
        // delete table in project-management
        const options = await coreRequest<JtOptions>(
            getJtOptions(tableId),
            user.authCookie
        )
        await coreRequest(removeTable(options.tableId), user.authCookie)

        // delete table in join-tables
        await coreRequest(deleteJt(tableId), user.authCookie)

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
