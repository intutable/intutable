import {
    asTable,
    ColumnInfo,
    getViewOptions,
    ViewDescriptor,
    ViewOptions,
} from "@intutable/lazy-views"
import { createColumnInTable } from "@intutable/project-management/dist/requests"
import { ColumnDescriptor } from "@intutable/project-management/dist/types"
import { Column } from "types"
import { coreRequest } from "api/utils"
import { DB, DBParser } from "utils/DBParser"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { withSessionRoute } from "auth"
import sanitizeName from "utils/sanitizeName"

import { StandardColumnSpecifier } from "@shared/types"
import { addColumnToTable } from "@backend/requests"
import { standardColumnAttributes } from "@shared/attributes"

/**
 * Add a column to a table.
 * Be very careful about using the `attributes` property, as you can also
 * override the default properties defined by
 * {@link shared/attributes/standardColumnAttributes}, most of which are
 * essential to functionality and not just for display purposes.
 * @tutorial
 * ```
 * - URL: /api/table/[tableId]/column
 * - Body: {
 *    column: {@type {Column.Serialized}}
 *    attributes: {@type {DB.Column}}
 * }
 * ```
 */
const POST = withCatchingAPIRoute(
    async (req, res, tableId: ViewDescriptor["id"]) => {
        const { column, attributes } = req.body as {
            column: StandardColumnSpecifier
            attributes?: Partial<DB.Column>
        }
        const user = req.session.user!

        const newColumn: Column.Serialized = await withReadWriteConnection(
            user,
            async sessionID => {
                const options = await coreRequest<ViewOptions>(
                    getViewOptions(sessionID, tableId),
                    user.authCookie
                )

                const key = sanitizeName(column.name)
                // add column in project-management
                const tableColumn = await coreRequest<ColumnDescriptor>(
                    createColumnInTable(
                        sessionID,
                        asTable(options.source).id,
                        key
                    ),
                    user.authCookie
                )

                // add column to table and filter views
                const columnIndex =
                    options.columnOptions.columns.length +
                    options.columnOptions.joins.reduce(
                        (acc, j) => acc + j.columns.length,
                        0
                    )
                const customAttributes = attributes ?? {}

                const tableViewColumn = await coreRequest<ColumnInfo>(
                    addColumnToTable(sessionID, tableId, {
                        parentColumnId: tableColumn.id,
                        attributes: {
                            ...standardColumnAttributes(
                                column.name,
                                column._cellContentType,
                                columnIndex
                            ),
                            ...customAttributes,
                        },
                    }),
                    user.authCookie
                )

                const parsedColumn = DBParser.parseColumnInfo(tableViewColumn)
                return parsedColumn
            }
        )

        res.status(200).json(newColumn)
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
