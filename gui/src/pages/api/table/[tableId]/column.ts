import { ViewDescriptor } from "@intutable/lazy-views"

import { Column } from "types"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { withSessionRoute } from "auth"

import { StandardColumnSpecifier } from "@shared/types"
import { createStandardColumn } from "@backend/requests"

/**
 * Add a column to a table.
 * Be very careful about using the `attributes` property, as they
 * override the default properties defined by
 * {@link shared.defaults.standardColumnAttributes}, most of which are
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
const POST = withCatchingAPIRoute(async (req, res, tableId: ViewDescriptor["id"]) => {
    const { column } = req.body as {
        column: StandardColumnSpecifier
    }
    const user = req.session.user!

    const newColumn: Column.Serialized = await withReadWriteConnection(user, async sessionID =>
        coreRequest<Column.Serialized>(
            createStandardColumn(sessionID, tableId, column),
            user.authCookie
        )
    )

    res.status(200).json(newColumn)
})

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
