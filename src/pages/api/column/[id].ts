import {
    TableDescriptor,
    ColumnDescriptor as PM_Column,
} from "@intutable/project-management/dist/types"
import {
    createColumnInTable,
    getTableData,
    removeColumn,
} from "@intutable/project-management/dist/requests"
import {
    JtDescriptor,
    ColumnDescriptor as JT_Column,
} from "@intutable/join-tables/dist/types"
import {
    addColumnToJt,
    changeColumnAttributes,
} from "@intutable/join-tables/dist/requests"
import { coreRequest, Parser } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { Column, PMTypes as PM, TableData } from "types"
import { makeError } from "utils/makeError"

const PATCH = async (
    req: NextApiRequest,
    res: NextApiResponse,
    id: PM.Column.ID
) => {
    try {
        const { user, update } = req.body as {
            user: User
            update: Column.Serialized
        }

        const deparsedUpdate = Parser.Column.deparse(update, id)

        // change property in project-management
        await coreRequest(
            changeColumnAttributes(id, deparsedUpdate.attributes),
            user.authCookie
        )

        const updatedColumn = await coreRequest<JT_Column>()
        res.status(200).send()
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const DELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    id: PM.Column.ID
) => {
    try {
        const { user } = req.body as {
            user: User
        }

        // delete column in project-management
        await coreRequest(removeColumn(id), user.authCookie)

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
        case "PATCH":
            PATCH(req, res, id)
            break
        case "DELETE":
            DELETE(req, res, id)
            break
        default:
            res.setHeader("Allow", ["PATCH", "DELETE"])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
