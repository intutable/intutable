import { ColumnType } from "@intutable/database/dist/column"
import {
    createView,
    tableId,
    viewId,
    getViewInfo,
    ViewInfo,
    ViewDescriptor,
    ColumnSpecifier,
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
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import sanitizeName from "utils/sanitizeName"
import {
    emptyRowOptions,
    defaultRowOptions,
    defaultViewName,
    standardColumnAttributes,
    indexColumnAttributes,
} from "dekanat-app-plugin/dist/defaults"

/**
 * Create a new table with the specified name.
 * The table will initially contain a column "Name" which can be
 * renamed, but not deleted. We call this column "user primary", and it
 * functions as the table's key for all directly user-relevant purposes, e.g.
 * in making previews of rows for link columns. It has nothing to do with
 * the actual, SQL primary key in the database.
 * @tutorial
 * ```
 * - Body: {
 *    projectId: {@type {number}}
 *    name: {@type {string}}
 * }
 * ```
 */
const POST = withCatchingAPIRoute(async (req, res) => {
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
            { name: "index", type: ColumnType.integer, options: [] },
            { name: "name", type: ColumnType.string, options: [] },
        ]),
        user.authCookie
    )

    // make specifiers for view columns
    const baseColumns = await coreRequest<PM_Column[]>(
        getColumnsFromTable(table.id),
        user.authCookie
    )
    const columnSpecs = baseColumns.map(c => {
        const makeColumnAttributes =
            defaultColumnAttributeMap[c.name] ||
            (() => ({} as ColumnSpecifier["attributes"]))
        return {
            parentColumnId: c.id,
            attributes: makeColumnAttributes(),
        }
    })

    // create table view
    const tableView = await coreRequest<ViewDescriptor>(
        createView(
            tableId(table.id),
            name,
            { columns: columnSpecs, joins: [] },
            emptyRowOptions(),
            user.id
        ),
        user.authCookie
    )

    // create default filter view
    const tableColumns = await coreRequest<ViewInfo>(
        getViewInfo(tableView.id),
        user.authCookie
    ).then(i => i.columns)
    await coreRequest<ViewDescriptor>(
        createView(
            viewId(tableView.id),
            defaultViewName(),
            { columns: [], joins: [] },
            defaultRowOptions(tableColumns),
            user.id
        ),
        user.authCookie
    )

    res.status(200).json(tableView)
})

export default withSessionRoute(
    withUserCheck(async (req, res) => {
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

const defaultColumnAttributeMap: Record<
    string,
    () => ColumnSpecifier["attributes"]
> = {
    _id: () => standardColumnAttributes("ID", "number", 0),
    index: indexColumnAttributes,
    name: () => standardColumnAttributes("Name", "string", 1, true),
}
