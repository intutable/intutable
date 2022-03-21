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
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { Column } from "types"
import { makeError } from "utils/makeError"

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, joinTable, baseTable, column } = req.body as {
            user: User
            joinTable: JtDescriptor
            baseTable: TableDescriptor
            column: Column.Serialized
        }

        // add column in project-management
        const tableColumn = await coreRequest<PM_Column>(
            createColumnInTable(baseTable.id, column.key),
            user.authCookie
        )

        const jtColumn = await coreRequest<JT_Column>(
            addColumnToJt(
                joinTable.id,
                Parser.Column.deparse(column, tableColumn.id)
            )
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
