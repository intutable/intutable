import {
    ColumnInfo as View_Column,
    ViewDescriptor,
    ViewOptions,
    addColumnToView,
    getViewOptions,
    asTable,
} from "@intutable/lazy-views"
import { createColumnInTable } from "@intutable/project-management/dist/requests"
import { ColumnDescriptor as PM_Column } from "@intutable/project-management/dist/types"
import { coreRequest, Parser } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { Column } from "types"
import { makeError } from "utils/error-handling/utils/makeError"
import { withUserCheck } from "utils/withUserCheck"

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
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
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
            addColumnToView(
                viewId,
                Parser.Column.deparse(column, tableColumn.id)
            ),
            user.authCookie
        )

        const parsedColumn = Parser.Column.parse(viewColumn)

        res.status(200).json(parsedColumn)
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