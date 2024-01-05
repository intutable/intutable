import { SerializedColumn, TableId } from "@shared/types"
import { renameTableColumn } from "../../../../../../../../../libs/dekanat-app-plugin/dist/requests"
import { ErrorCode } from "../../../../../../../../../libs/dekanat-app-plugin/dist/error"

import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"

/**
 * Rename a column.
 * @tutorial
 * ```
 * URL : `/api/table/[tableId]/column/[columnId]/rename`, e.g.
 * `/api/table/5/column/32/rename`
 * - Body: { newName: string }
 * ```
 */
const PATCH = withCatchingAPIRoute(
    async (req, res, tableId: TableId, columnId: SerializedColumn["id"]) => {
        const { newName } = req.body as { newName: string }
        const user = req.session.user!

        await withReadWriteConnection(user, async connectionId =>
            coreRequest(
                renameTableColumn(connectionId, tableId, columnId, newName),
                user.authCookie
            )
        ).catch(e =>
            e.code === ErrorCode.alreadyTaken ? Promise.reject("alreadyTaken") : Promise.reject(e)
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
