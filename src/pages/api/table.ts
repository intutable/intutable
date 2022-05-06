import { ColumnType } from "@intutable/database/dist/column"

import {
    ViewDescriptor,
    SortOrder,
    createView,
    tableId,
} from "@intutable/lazy-views"
import {
    createTableInProject,
    getColumnsFromTable,
    getTablesFromProject,
} from "@intutable/project-management/dist/requests"
import {
    ColumnDescriptor as PM_Column,
    ProjectDescriptor,
    TableDescriptor,
} from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PM } from "types"
import { makeError } from "utils/error-handling/utils/makeError"
import sanitizeName from "utils/sanitizeName"
import { withUserCheck } from "utils/withUserCheck"

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
        const user = req.session.user!

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

        // make specifiers for view columns
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

        // create view
        const tableView = await coreRequest<ViewDescriptor>(
            createView(
                tableId(table.id),
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

        res.status(200).json(tableView)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default withSessionRoute(
    withUserCheck(async (req: NextApiRequest, res: NextApiResponse) => {
        switch (req.method) {
            case "POST":
                await POST(req, res)
                break
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
