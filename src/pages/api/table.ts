import type { NextApiRequest, NextApiResponse } from "next"
import { ColumnType } from "@intutable/database/dist/column"
import {
    TableDescriptor,
    ColumnDescriptor as PM_Column,
} from "@intutable/project-management/dist/types"
import {
    createTableInProject,
    getColumnsFromTable,
} from "@intutable/project-management/dist/requests"
import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { createJt } from "@intutable/join-tables/dist/requests"
import { coreRequest } from "api/utils"
import { User } from "auth"
import { PMTypes as PM } from "types"
import { makeError } from "utils/makeError"
import { AUTH_COOKIE_KEY } from "context/AuthContext"

/**
 * Create a new table with the specified name.
 * The table will contain an ID column
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, project, name } = req.body as {
            user: User
            project: PM.Project
            name: PM.Table.Name
        }

        // create table in project-management with primary "name" column
        const table = await coreRequest<TableDescriptor>(
            createTableInProject(user.id, project.id, name, [
                { name: "name", type: ColumnType.string, options: [] },
            ]),
            req.cookies[AUTH_COOKIE_KEY]
        )

        // make specifiers for JT columns
        const baseColumns = await coreRequest<PM_Column[]>(
            getColumnsFromTable(table.id),
            req.cookies[AUTH_COOKIE_KEY]
        )
        const columnSpecs = baseColumns.map(c => ({
            parentColumnId: c.id,
            attributes:
                c.name === "name"
                    ? { userPrimary: 1, displayName: "Name", editor: "string" }
                    : { displayName: "ID", editor: "number" },
        }))

        // create table in join-tables
        const jtTable = await coreRequest<JtDescriptor>(
            createJt(
                table.id,
                table.name,
                { columns: columnSpecs, joins: [] },
                { conditions: [], sortColumns: [], groupColumns: [] },
                user.id
            ),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).json(jtTable)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req

    switch (method) {
        case "POST":
            await POST(req, res)
            break
        default:
            res.setHeader("Allow", ["POST"])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
