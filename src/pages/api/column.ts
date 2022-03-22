import { addColumnToJt } from "@intutable/join-tables/dist/requests"
import {
    ColumnDescriptor as JT_Column,
    JtDescriptor,
} from "@intutable/join-tables/dist/types"
import { createColumnInTable } from "@intutable/project-management/dist/requests"
import {
    ColumnDescriptor as PM_Column,
    TableDescriptor,
} from "@intutable/project-management/dist/types"
import { coreRequest, Parser } from "api/utils"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import type { NextApiRequest, NextApiResponse } from "next"
import { Column } from "types"
import { makeError } from "utils/makeError"

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { joinTable, baseTable, column } = req.body as {
            joinTable: JtDescriptor
            baseTable: TableDescriptor
            column: Column.Serialized
        }

        // add column in project-management
        const tableColumn = await coreRequest<PM_Column>(
            createColumnInTable(baseTable.id, column.key),
            req.cookies[AUTH_COOKIE_KEY]
        )

        const jtColumn = await coreRequest<JT_Column>(
            addColumnToJt(
                joinTable.id,
                Parser.Column.deparse(column, tableColumn.id)
            ),
            req.cookies[AUTH_COOKIE_KEY]
        )

        const parsedColumn = Parser.Column.parse(jtColumn)

        res.status(200).json(parsedColumn)
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
        default:
            res.setHeader("Allow", ["POST"])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
