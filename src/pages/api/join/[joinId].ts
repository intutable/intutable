import { update } from "@intutable/database/dist/requests"
import {
    asTable,
    getViewInfo,
    JoinDescriptor,
    ViewDescriptor,
    ViewInfo,
} from "@intutable/lazy-views"
import { getTableInfo } from "@intutable/project-management/dist/requests"
import { TableInfo } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import { project_management_constants } from "types/type-annotations/project-management"

/**
 * Link rows in linked tables, by setting the value in the linking table's
 * foreign key column.
 * @tutorial
 * ```
 * - URL: `/api/join/[id]`, e.g. `/api/join/3`
 * - Body: {
 *    viewId: {@type {number} The ID of the view in which to create the link.
 *    rowId: {@type {number}} Row of the linking table.
 *    value: {@type {number}} The ID of the row in the linked table.
 * }
 * ```
 */
const POST = withCatchingAPIRoute(
    async (req, res, joinId: JoinDescriptor["id"]) => {
        const { viewId, rowId, value } = req.body as {
            viewId: ViewDescriptor["id"]
            rowId: number
            value: number
        }
        const user = req.session.user!

        const viewInfo = await coreRequest<ViewInfo>(
            getViewInfo(viewId),
            user.authCookie
        )
        const baseTableInfo = await coreRequest<TableInfo>(
            getTableInfo(asTable(viewInfo.source).table.id),
            user.authCookie
        )

        const join = viewInfo.joins.find(j => j.id === joinId)!

        const fkColumn = baseTableInfo.columns.find(c => c.id === join.on[0])!

        await coreRequest(
            update(asTable(viewInfo.source).table.key, {
                condition: [project_management_constants.UID_KEY, rowId],
                update: { [fkColumn.name]: value },
            }),
            user.authCookie
        )

        res.status(200).end()
    }
)

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        const { query } = req
        const joinId = parseInt(query.joinId as string)

        switch (req.method) {
            case "POST":
                await POST(req, res, joinId)
                break
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
