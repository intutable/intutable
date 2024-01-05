import { SerializedColumn, TableId } from "@shared/types"
import { changeCellType } from "../../../../../../../../../libs/dekanat-app-plugin/dist/requests"

import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"

/**
 * Change a column's cellType
 * @tutorial
 * ```
 * URL : `/api/table/[tableId]/column/[columnId]/changeCellType`, e.g.
 * `/api/table/5/column/32/changeCellType`
 * - Body: { newType: string }
 * ```
 */
const PATCH = withCatchingAPIRoute(
    async (req, res, tableId: TableId, columnId: SerializedColumn["id"]) => {
        const { newType } = req.body as { newType: string }
        const user = req.session.user!

        await withReadWriteConnection(user, async connectionId =>
            coreRequest(changeCellType(connectionId, tableId, columnId, newType), user.authCookie)
        )

        res.status(200).json({})
    }
)

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        const { query, method } = req
        const tableId = parseInt(query.tableId as string)
        const columnId = parseInt(query.columnId as string)

        switch (method) {
            case "PATCH":
                await PATCH(req, res, tableId, columnId)
                break
            default:
                res.setHeader("Allow", ["PATCH", "DELETE"])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    })
)
