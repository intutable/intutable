import {
    ColumnDescriptor as JT_Column,
    JtDescriptor,
    JtOptions,
} from "@intutable/join-tables/dist/types"
import {
    addColumnToJt,
    getJtOptions,
} from "@intutable/join-tables/dist/requests"
import { createColumnInTable } from "@intutable/project-management/dist/requests"
import { ColumnDescriptor as PM_Column } from "@intutable/project-management/dist/types"
import { coreRequest, Parser } from "api/utils"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import type { NextApiRequest, NextApiResponse } from "next"
import { Column } from "types"
import { makeError } from "utils/makeError"

/**
 * Add a column to a table.
 * @tutorial
 * ```
 * - Body: {
 *    jtId: {@type {number}}
 *    column: {@type {Column.Serialized}}
 * }
 * ```
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { jtId, column } = req.body as {
            jtId: JtDescriptor["id"]
            column: Column.Serialized
        }

        const options = await coreRequest<JtOptions>(
            getJtOptions(jtId),
            req.cookies[AUTH_COOKIE_KEY]
        )

        // add column in project-management
        const tableColumn = await coreRequest<PM_Column>(
            createColumnInTable(options.tableId, column.key),
            req.cookies[AUTH_COOKIE_KEY]
        )

        const jtColumn = await coreRequest<JT_Column>(
            addColumnToJt(jtId, Parser.Column.deparse(column, tableColumn.id)),
            req.cookies[AUTH_COOKIE_KEY]
        )

        const parsedColumn = Parser.Column.parse(jtColumn)

        res.status(200).json(parsedColumn)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case "POST":
            await POST(req, res)
            break
        default:
            res.setHeader("Allow", ["POST"])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
