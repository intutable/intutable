import {
    changeColumnAttributes,
    getJtInfo,
    removeColumnFromJt,
} from "@intutable/join-tables/dist/requests"
import { JtDescriptor, JtInfo } from "@intutable/join-tables/dist/types"
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
        const { user, joinTable, update } = req.body as {
            user: User
            joinTable: JtDescriptor
            update: Column.Serialized
        }

        const deparsedUpdate = Parser.Column.deparse(update, id)

        // change property in join-tables
        await coreRequest(
            changeColumnAttributes(id, deparsedUpdate.attributes),
            user.authCookie
        )

        const updatedColumn = await coreRequest<JtInfo>(
            getJtInfo(joinTable.id),
            user.authCookie
        ).then(info => info.columns.find(c => c.id === id))

        if (updatedColumn == null)
            throw new Error("Internal Error: Column not found after update")

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
        const { user, joinTable } = req.body as {
            joinTable: JtDescriptor
            user: User
        }

        const info = await coreRequest<JtInfo>(
            getJtInfo(joinTable.id),
            user.authCookie
        )

        const column = info.columns.find(c => c.id === id)!
        if (!column) {
            res.status(400).json({
                error: `no column with ID ${id} in join table #${joinTable.id}`,
            })
            return
        }

        // delete column in join-tables
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
