import {
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
import sanitizeName from "utils/sanitizeName"

import { StandardColumnSpecifier } from "@backend/types"
import { addColumnToTable } from "@backend/requests"
import { standardColumnAttributes } from "@backend/defaults"

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
const POST = withCatchingAPIRoute(
    async (req, res, tableId: ViewDescriptor["id"]) => {
        const { column } = req.body as {
            column: StandardColumnSpecifier
        }
        const user = req.session.user!

        const options = await coreRequest<ViewOptions>(
            getViewOptions(tableId),
            user.authCookie
        )

        const key = sanitizeName(column.name)
        // add column in project-management
        const tableColumn = await coreRequest<PM_Column>(
            createColumnInTable(asTable(options.source).id, key),
            user.authCookie
        )

        // add column to table and filter views
        const columnIndex =
            options.columnOptions.columns.length +
            options.columnOptions.joins.reduce(
                (acc, j) => acc + j.columns.length,
                0
            )
        const tableViewColumn = await coreRequest<View_Column>(
            addColumnToTable(tableId, {
                parentColumnId: tableColumn.id,
                attributes: standardColumnAttributes(
                    column.name,
                    column._cellContentType,
                    columnIndex
                ),
            }),
            user.authCookie
        )

        const parsedColumn = Parser.Column.parse(tableViewColumn)

        res.status(200).json(parsedColumn)
    }
)

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        const { query, method } = req
        const tableId = parseInt(query.tableId as string)
        switch (method) {
            case "POST":
                await POST(req, res, tableId)
                break
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
