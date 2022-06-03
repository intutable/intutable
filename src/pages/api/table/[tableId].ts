import {
    asTable,
    deleteView,
    getViewData,
    getViewOptions,
    listViews,
    renameView,
    TableDescriptor,
    tableId as makeTableId,
    ViewData,
    ViewDescriptor,
    ViewOptions,
} from "@intutable/lazy-views"
import {
    getTablesFromProject,
    removeTable,
} from "@intutable/project-management/dist/requests"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { Table } from "api/utils/parse"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"

/**
 * GET a single table view's data {@type {TableData.Serialized}}.
 *
 * @tutorial
 * ```
 * - URL: `/api/table/[id]` e.g. `/api/table/1`
 * - Body: {}
 * ```
 */
const GET = withCatchingAPIRoute(
    async (req, res, tableId: ViewDescriptor["id"]) => {
        const user = req.session.user!
        const tableData = await coreRequest<ViewData>(
            getViewData(tableId),
            user.authCookie
        )

        // parse it
        const parsedTableData = Table.parse(tableData)

        res.status(200).json(parsedTableData)
    }
)

/**
 * PATCH/update the name of a single table.
 * Returns the updated table view {@type {ViewDescriptor}}.
 * 
 * // TODO: In a future version this api route will be able to adjust more than the name.

 * @tutorial
 * ```
 * - URL: `/api/project/[id]` e.g. `/api/project/1`
 * - Body: {
 *     newName: {@type {string}}
 *   }
 * ```
 */
const PATCH = withCatchingAPIRoute(
    async (req, res, tableId: ViewDescriptor["id"]) => {
        const { newName, project } = req.body as {
            newName: ViewDescriptor["name"]
            project: ProjectDescriptor
        }
        const user = req.session.user!

        // check if name is taken
        const baseTables = await coreRequest<TableDescriptor[]>(
            getTablesFromProject(project.id),
            user.authCookie
        )
        const tables = await Promise.all(
            baseTables.map(tbl =>
                coreRequest<ViewDescriptor[]>(
                    listViews(makeTableId(tbl.id)),
                    user.authCookie
                )
            )
        ).then(tableLists => tableLists.flat())
        const isTaken = tables
            .map(tbl => tbl.name.toLowerCase())
            .includes(newName.toLowerCase())

        // rename only view, underlying table's name does not matter.
        const updatedTable = await coreRequest<ViewDescriptor>(
            renameView(tableId, newName),
            user.authCookie
        )

        if (isTaken) throw new Error("alreadyTaken")

        res.status(200).json(updatedTable)
    }
)

/**
 * DELETE a table. Returns an empty object.
 *
 * @tutorial
 * ```
 * - URL: `/api/table/[id]` e.g. `/api/table/1`
 * - Body: {}
 * ```
 */
const DELETE = withCatchingAPIRoute(
    async (req, res, tableId: ViewDescriptor["id"]) => {
        const user = req.session.user!
        // delete table in project-management
        const options = await coreRequest<ViewOptions>(
            getViewOptions(tableId),
            user.authCookie
        )
        await coreRequest(
            removeTable(asTable(options.source).id),
            user.authCookie
        )

        // delete table in lazy-views
        await coreRequest(deleteView(tableId), user.authCookie)

        res.status(200).json({})
    }
)

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        const { query, method } = req
        const tableId = parseInt(query.tableId as string)

        switch (method) {
            case "GET":
                await GET(req, res, tableId)
                break
            case "PATCH":
                await PATCH(req, res, tableId)
                break
            case "DELETE":
                await DELETE(req, res, tableId)
                break
            default:
                res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    })
)
