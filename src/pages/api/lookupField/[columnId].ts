import {
    ViewDescriptor,
    ViewInfo,
    ColumnInfo,
    addColumnToView,
    getViewInfo,
    asView,
} from "@intutable/lazy-views"
import { coreRequest } from "api/utils"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/error-handling/utils/makeError"
import { withSessionRoute } from "auth"
import { withUserCheck } from "utils/withUserCheck"
import { lookupColumnAttributes } from "backend/defaults"
import { addColumnToFilterViews } from "utils/backend/views"

/**
 * Add a lookup field from a linked table.
 * @tutorial
 * ```
 * - Body: {
 *     viewId: {@type {number}}
 *     joinId: {@type {number}}
 * }
 * ```
 */
const POST = async (
    req: NextApiRequest,
    res: NextApiResponse,
    columnId: ColumnInfo["id"]
) => {
    try {
        const { tableViewId, joinId } = req.body as {
            tableViewId: ViewDescriptor["id"]
            joinId: Exclude<ColumnInfo["joinId"], null>
        }
        const user = req.session.user!

        const viewInfo = await coreRequest<ViewInfo>(
            getViewInfo(tableViewId),
            user.authCookie
        )

        // find the column
        const join = viewInfo.joins.find(j => j.id === joinId)!
        const foreignViewInfo = await coreRequest<ViewInfo>(
            getViewInfo(asView(join.foreignSource).id),
            user.authCookie
        )
        const foreignColumn = foreignViewInfo.columns.find(
            c => c.id === columnId
        )!

        // determine props
        const displayName =
            foreignColumn.attributes.displayName || foreignColumn.name
        const attributes = lookupColumnAttributes(displayName)

        // add to table view
        const newColumn = await coreRequest<ColumnInfo>(
            addColumnToView(
                tableViewId,
                { parentColumnId: columnId, attributes },
                joinId
            ),
            user.authCookie
        )

        // add to filter views
        await addColumnToFilterViews(
            tableViewId,
            { parentColumnId: newColumn.id, attributes },
            user.authCookie
        )

        res.status(200).json(newColumn)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default withSessionRoute(
    withUserCheck(async (req: NextApiRequest, res: NextApiResponse) => {
        const { query } = req
        const columnId = parseInt(query.columnId as string)

        switch (req.method) {
            case "POST":
                await POST(req, res, columnId)
                break
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
