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
    const { viewId, column } = req.body as {
        viewId: ViewDescriptor["id"]
        column: Column.Serialized
    }
    const user = req.session.user!

    const options = await coreRequest<ViewOptions>(
        getViewOptions(viewId),
        user.authCookie
    )

    // add column in project-management
    const tableColumn = await coreRequest<PM_Column>(
        createColumnInTable(asTable(options.source).id, column.key),
        user.authCookie
    )

    const viewColumn = await coreRequest<View_Column>(
        addColumnToView(viewId, Parser.Column.deparse(column, tableColumn.id)),
        user.authCookie
    )

    const parsedColumn = Parser.Column.parse(viewColumn)

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
