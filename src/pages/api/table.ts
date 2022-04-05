import type { NextApiRequest, NextApiResponse } from "next"
import { ColumnType } from "@intutable/database/dist/column"
import {
    ProjectDescriptor,
    TableDescriptor,
    ColumnDescriptor as PM_Column,
} from "@intutable/project-management/dist/types"
import {
    getTablesFromProject,
    createTableInProject,
    getColumnsFromTable,
} from "@intutable/project-management/dist/requests"
import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { createJt } from "@intutable/join-tables/dist/requests"
import { coreRequest } from "api/utils"
import { User } from "auth"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import { makeError } from "utils/makeError"
import sanitizeName from "utils/sanitizeName"

/**
 * Create a new table with the specified name.
 * The table will initially contain a column "Name" which can be
 * renamed, but not deleted. We call this column "user primary", and it
 * functions as the table's key for all directly user-relevant purposes, e.g.
 * in making previews of rows for link columns. It has nothing to do with
 * the actual, integer primary key in the database.
 * @tutorial
 * ```
 * - Body: {
 *    user: {@type {User}}
 *    projectId: {@type {number}}
 *    name: {@type {string}}
 * }
 * ```
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, projectId, name } = req.body as {
            user: User
            projectId: ProjectDescriptor["id"]
            name: string
        }

        const internalName = sanitizeName(name)

        const existingTables = await coreRequest<TableDescriptor[]>(
            getTablesFromProject(projectId),
            req.cookies[AUTH_COOKIE_KEY]
        )
        if (existingTables.some(t => t.name === internalName))
            throw Error("alreadyTaken")

        // create table in project-management with primary "name" column
        const table = await coreRequest<TableDescriptor>(
            createTableInProject(user.id, projectId, internalName, [
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
                name,
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
