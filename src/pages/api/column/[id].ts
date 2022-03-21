import {
    changeColumnAttributes,
    getColumnInfo,
    removeColumnFromJt,
} from "@intutable/join-tables/dist/requests"
import {
    ColumnDescriptor
} from "@intutable/join-tables/dist/types"
import { removeColumn } from "@intutable/project-management/dist/requests"
import { coreRequest, Parser } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { Column, PMTypes as PM } from "types"
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

        // change property in join-tables, underlying table column is never used
        const updatedColumn = await coreRequest<ColumnDescriptor>(
            changeColumnAttributes(id, deparsedUpdate.attributes),
            user.authCookie
        )

        res.status(200).json(updatedColumn)
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
        const column = await coreRequest<ColumnDescriptor>(
            getColumnInfo(id),
            user.authCookie
        )
        if (column.joinId !== null)
            throw new Error(
                "cannot delete column of other (join) table."
                    + ` ID: ${id}`
            )

        await coreRequest(removeColumnFromJt(id))
        await coreRequest(removeColumn(column.parentColumnId))

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
