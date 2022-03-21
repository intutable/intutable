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
import { User } from "auth"
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
    id: JtDescriptor["id"]
) => {
    try {
        const { user } = req.body as {
            user: User
        }

        const tableData = await coreRequest<JtData>(
            getJtData(id),
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
    id: JtDescriptor["id"]
) => {
    try {
        const { user, newName } = req.body as {
            user: User
            newName: JtDescriptor["name"]
        }

        // rename table in join-tables
        const updatedTable = await coreRequest<JtDescriptor>(
            renameJt(id, newName),
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
 * - URL: `/api/table/[id]` e.g. `/api/table/[1]`
 * - Body: {
 *  user: {@type {User}}
 * }
 * ```
 */
const DELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    id: JtDescriptor["id"]
) => {
    try {
        const { user } = req.body as {
            user: User
        }

        // delete table in project-management
        const options = await coreRequest<JtOptions>(getJtOptions(id))
        await coreRequest(removeTable(options.tableId), user.authCookie)

        // delete table in join-tables
        await coreRequest(deleteJt(id), user.authCookie)

        res.status(200).send({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { query, method } = req
    const id = parseInt(query.id as string)

    switch (method) {
        case "GET":
            GET(req, res, id)
            break
        case "PATCH":
            PATCH(req, res, id)
            break
        case "DELETE":
            DELETE(req, res, id)
            break
        default:
            res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
