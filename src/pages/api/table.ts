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
import { JtDescriptor, SortOrder } from "@intutable/join-tables/dist/types"
import { createJt } from "@intutable/join-tables/dist/requests"
import { coreRequest } from "api/utils"
import { User } from "types/User"
import { makeError } from "utils/makeError"
import { PM } from "types"
import sanitizeName from "utils/sanitizeName"
import { withSessionRoute } from "auth"
import { checkUser } from "utils/checkUser"

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
        const { projectId, name } = req.body as {
            projectId: ProjectDescriptor["id"]
            name: string
        }
        const user = checkUser(req.session.user)

        const internalName = sanitizeName(name)

        const existingTables = await coreRequest<TableDescriptor[]>(
            getTablesFromProject(projectId),
            user.authCookie
        )
        if (existingTables.some(t => t.name === internalName))
            throw Error("alreadyTaken")

        // create table in project-management with primary "name" column
        const table = await coreRequest<TableDescriptor>(
            createTableInProject(user.id, projectId, internalName, [
                { name: "name", type: ColumnType.string, options: [] },
            ]),
            user.authCookie
        )

        // make specifiers for JT columns
        const baseColumns = await coreRequest<PM_Column[]>(
            getColumnsFromTable(table.id),
            user.authCookie
        )
        const columnSpecs = baseColumns.map(c => ({
            parentColumnId: c.id,
            attributes:
                c.name === "name"
                    ? { userPrimary: 1, displayName: "Name", editor: "string" }
                    : { displayName: "ID", editor: "number" },
        }))

        const baseIdColumn = baseColumns.find(c => c.name === PM.UID_KEY)!

        // create table in join-tables
        const jtTable = await coreRequest<JtDescriptor>(
            createJt(
                table.id,
                name,
                { columns: columnSpecs, joins: [] },
                {
                    conditions: [],
                    groupColumns: [],
                    sortColumns: [
                        {
                            column: baseIdColumn.id,
                            order: SortOrder.Ascending,
                        },
                    ],
                },
                user.id
            ),
            user.authCookie
        )

        res.status(200).json(jtTable)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default withSessionRoute(
    async (req: NextApiRequest, res: NextApiResponse) => {
        switch (req.method) {
            case "POST":
                await POST(req, res)
                break
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    }
)
