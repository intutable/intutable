import {
    addColumnToView,
    asTable,
    ColumnInfo as View_Column,
    getViewOptions,
    ViewDescriptor,
    ViewOptions,
} from "@intutable/lazy-views"
import { createColumnInTable } from "@intutable/project-management/dist/requests"
import { ColumnDescriptor as PM_Column } from "@intutable/project-management/dist/types"
import { coreRequest, Parser } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import { Column } from "types"
import { addColumnToFilterViews } from "utils/backend/views"

/**
 * Add a column to a table.
 * @tutorial
 * ```
 * - Body: {
 *    viewId: {@type {number}}
 *    column: {@type {Column.Serialized}}
 * }
 * ```
 */
const POST = withCatchingAPIRoute(async (req, res) => {
    const { tableId, column } = req.body as {
        tableId: ViewDescriptor["id"]
        column: Column.Serialized
    }
    const user = req.session.user!

    const options = await coreRequest<ViewOptions>(
        getViewOptions(tableId),
        user.authCookie
    )

    // add column in project-management
    const tableColumn = await coreRequest<PM_Column>(
        createColumnInTable(asTable(options.source).id, column.key),
        user.authCookie
    )

    // add column to table view
    const tableViewColumn = await coreRequest<View_Column>(
        addColumnToView(tableId, Parser.Column.deparse(column, tableColumn.id)),
        user.authCookie
    )

    // add column to each filter view
    await addColumnToFilterViews(
        tableId,
        Parser.Column.deparse(column, tableViewColumn.id),
        user.authCookie
    )

    const parsedColumn = Parser.Column.parse(tableViewColumn)

    res.status(200).json(parsedColumn)
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
