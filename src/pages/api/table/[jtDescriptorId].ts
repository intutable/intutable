import {
    deleteJt,
    getJtData,
    renameJt,
    getJtOptions,
} from "@intutable/join-tables/dist/requests"
import {
    JtDescriptor,
    JtData,
    JtOptions,
} from "@intutable/join-tables/dist/types"
import { removeTable } from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"

/**
 * GET a single join table's data @type {JtData}.
 *
 * @tutorial
 * ```
 * - URL: `/api/table/[id]` e.g. `/api/table/[1]`
 * - Body: {
 *  user: {@type {User}}
 * }
 * ```
 */
const GET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    jtDescriptorId: JtDescriptor["id"]
) => {
    try {
        const tableData = await coreRequest<JtData>(
            getJtData(jtDescriptorId),
            req.cookies[AUTH_COOKIE_KEY]
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
 *
 * // TODO: In a future version this api point will be able to adjust more than the name.
 *
 * @tutorial
 * ```
 * - URL: `/api/project/[id]` e.g. `/api/project/[1]`
 * - Body: {
 *  user: {@type {User}}
 *  newName: {@type {string}}
 * }
 * ```
 */
const PATCH = async (
    req: NextApiRequest,
    res: NextApiResponse,
    jtDescriptorId: JtDescriptor["id"]
) => {
    try {
        const { newName } = req.body as {
            newName: JtDescriptor["name"]
        }

        // rename table in join-tables
        const updatedTable = await coreRequest<JtDescriptor>(
            renameJt(jtDescriptorId, newName),
            req.cookies[AUTH_COOKIE_KEY]
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
 * - URL: `/api/table/[id]` e.g. `/api/table/[1]`
 * - Body: {
 *  user: {@type {User}}
 * }
 * ```
 */
const DELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    jtDescriptorId: JtDescriptor["id"]
) => {
    try {
        // delete table in project-management
        const options = await coreRequest<JtOptions>(
            getJtOptions(jtDescriptorId)
        )
        await coreRequest(
            removeTable(options.tableId),
            req.cookies[AUTH_COOKIE_KEY]
        )

        // delete table in join-tables
        await coreRequest(
            deleteJt(jtDescriptorId),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).send({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { query, method } = req
    const jtDescriptorId = parseInt(query.jtDescriptorId as string)

    switch (method) {
        case "GET":
            await GET(req, res, jtDescriptorId)
            break
        case "PATCH":
            await PATCH(req, res, jtDescriptorId)
            break
        case "DELETE":
            await DELETE(req, res, jtDescriptorId)
            break
        default:
            res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
