import {
    addColumnToView,
    asView,
    ColumnInfo,
    getViewInfo,
    ViewDescriptor,
    ViewInfo,
} from "@intutable/lazy-views"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import { lookupColumnAttributes } from "@backend/defaults"
import { addColumnToFilterViews } from "utils/backend/views"

/**
 * Add a lookup field from a linked table.
 * @tutorial
 * ```
 * - Body: {
 *     tableId: {@type {number}}
 *     joinId: {@type {number}}
 * }
 * ```
 */
const POST = withCatchingAPIRoute(
    async (req, res, parentColumnId: ColumnInfo["id"]) => {
        const { tableId, joinId } = req.body as {
            tableId: ViewDescriptor["id"]
            joinId: Exclude<ColumnInfo["joinId"], null>
        }
        const user = req.session.user!

        const viewInfo = await coreRequest<ViewInfo>(
            getViewInfo(tableId),
            user.authCookie
        )

        // find the column
        const join = viewInfo.joins.find(j => j.id === joinId)!
        const foreignViewInfo = await coreRequest<ViewInfo>(
            getViewInfo(asView(join.foreignSource).id),
            user.authCookie
        )
        const foreignColumn = foreignViewInfo.columns.find(
            c => c.id === parentColumnId
        )!

        // determine props
        const displayName =
            foreignColumn.attributes.displayName || foreignColumn.name
        const attributes = lookupColumnAttributes(displayName)

        // add to table view
        const newColumn = await coreRequest<ColumnInfo>(
            addColumnToView(
                tableId,
                { parentColumnId: parentColumnId, attributes },
                joinId
            ),
            user.authCookie
        )

        // add to filter views
        await addColumnToFilterViews(
            tableId,
            { parentColumnId: newColumn.id, attributes },
            user.authCookie
        )

        res.status(200).json(newColumn)
    }
)

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        const { query } = req
        const parentColumnId = parseInt(query.parentColumnId as string)

        switch (req.method) {
            case "POST":
                await POST(req, res, parentColumnId)
                break
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
