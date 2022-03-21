import {
    changeColumnAttributes,
    createColumnInTable,
    getTableData,
    removeColumn,
} from "@intutable/project-management/dist/requests"
import { coreRequest, Parser } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { Column, PMTypes as PM, TableData } from "types"
import { makeError } from "utils/makeError"

/**
 * Utility that helps getting a column id when there is no column id.
 */
const _getColumnId = async (
    user: User,
    tableId: PM.Table.ID,
    key: Column["key"]
): Promise<PM.Column.ID> => {
    const table = (await coreRequest(
        getTableData(tableId),
        user.authCookie
    )) as TableData.DBSchema
    const column = table.columns.find(col => col.columnName === key)
    if (column == null)
        throw new Error(`Did not found a column where key equals '${key}'`)
    return column._id
}

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, table, column } = req.body as {
            user: User
            table: PM.Table
            column: Column.Serialized
        }

        // add column in project-management
        const colDescriptor = await coreRequest<PM.Column>(
            createColumnInTable(table.id, column.key),
            user.authCookie
        )

        const deparsedUpdate = Parser.Column.deparse(column, colDescriptor.id)

        // add props to that column
        const col = await coreRequest<Column.DBSchema>(
            changeColumnAttributes(colDescriptor.id, deparsedUpdate),
            user.authCookie
        )

        const parsedColumn = Parser.Column.parse(col)

        res.status(200).json(parsedColumn)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, table, key, update } = req.body as {
            user: User
            table: PM.Table
            key: Column["key"]
            update: {
                [key in keyof Column.Serialized]: Column.Serialized[key]
            }
        }

        const columnId = await _getColumnId(user, table.id, key)

        const deparsedUpdate = Parser.Column.deparse(update, columnId)

        // change property in project-management
        const updatedCol = await coreRequest<Column.DBSchema>(
            changeColumnAttributes(columnId, deparsedUpdate),
            user.authCookie
        )

        const parsedColumn = Parser.Column.parse(updatedCol)

        res.status(200).json(parsedColumn)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, table, key } = req.body as {
            user: User
            table: PM.Table
            key: Column["key"]
        }

        // delete column in project-management
        const columnId = await _getColumnId(user, table.id, key)
        await coreRequest(removeColumn(columnId), user.authCookie)

        res.status(200).send({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "POST":
            POST(req, res)
            break
        case "PATCH":
            PATCH(req, res)
            break
        case "DELETE":
            DELETE(req, res)
            break
        default:
            res.setHeader("Allow", ["POST", "PATCH", "DELETE"])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
