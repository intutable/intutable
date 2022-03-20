import {
    deleteJt,
    getJtData,
    renameJt,
} from "@intutable/join-tables/dist/requests"
import { JtData } from "@intutable/join-tables/dist/types"
import { removeTable } from "@intutable/project-management/dist/requests"
import { CHANNEL } from "api/constants"
import { coreRequest } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PMTypes as PM } from "types"
import { makeError } from "utils/makeError"

const GET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    id: PM.Table.ID
) => {
    try {
        const { user } = req.body as {
            user: User
        }

        const tableData = await coreRequest<JtData>(
            CHANNEL.JOIN_TABLES,
            getJtData.name,
            getJtData(id),
            user.authCookie
        )

        res.status(200).json(tableData)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const PATCH = async (
    req: NextApiRequest,
    res: NextApiResponse,
    id: PM.Table.ID
) => {
    try {
        const { user, newName } = req.body as {
            user: User
            newName: PM.Table.Name
        }

        // rename table in join-tables
        const updatedTable = await coreRequest<PM.Table>(
            CHANNEL.JOIN_TABLES,
            renameJt.name,
            renameJt(id, newName),
            user.authCookie
        )

        res.status(200).json(updatedTable)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const DELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    id: PM.Table.ID
) => {
    try {
        const { user } = req.body as {
            user: User
        }

        // delete table in project-management
        await coreRequest(
            CHANNEL.PROJECT_MANAGEMENT,
            removeTable.name,
            removeTable(id),
            user.authCookie
        )

        // delete table in join-tables
        await coreRequest(
            CHANNEL.JOIN_TABLES,
            deleteJt.name,
            deleteJt(id),
            user.authCookie
        )

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
