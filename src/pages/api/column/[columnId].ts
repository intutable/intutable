import {
    changeColumnAttributes,
    getColumnInfo,
    removeColumnFromJt,
} from "@intutable/join-tables/dist/requests"
import { ColumnDescriptor } from "@intutable/join-tables/dist/types"
import { removeColumn } from "@intutable/project-management/dist/requests"
import { coreRequest, Parser } from "api/utils"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import type { NextApiRequest, NextApiResponse } from "next"
import { Column, PMTypes as PM } from "types"
import { makeError } from "utils/makeError"

const PATCH = async (
    req: NextApiRequest,
    res: NextApiResponse,
    columnId: PM.Column.ID
) => {
    try {
        const { update } = req.body as {
            update: Column.Serialized
        }

        const deparsedUpdate = Parser.Column.deparse(update, columnId)

        // change property in join-tables, underlying table column is never used
        const updatedColumn = await coreRequest<ColumnDescriptor>(
            changeColumnAttributes(columnId, deparsedUpdate.attributes),
            req.cookies[AUTH_COOKIE_KEY]
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
    columnId: PM.Column.ID
) => {
    try {
        const column = await coreRequest<ColumnDescriptor>(
            getColumnInfo(columnId),
            req.cookies[AUTH_COOKIE_KEY]
        )

        await coreRequest(removeColumnFromJt(columnId))
        // if column belongs to base table, delete underlying TableColumn too
        if (column.joinId === null)
            await coreRequest(removeColumn(column.parentColumnId))

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
}
