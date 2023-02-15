import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { withSessionRoute } from "auth"
import { TableId, SerializedColumn } from "@shared/types"
import { createLookupColumn, LookupColumnSpecifier } from "@backend/requests"

/**
 * Add a lookup field from a linked table, i.e. another column whose data
 * are not entered directly, but copied from the joined table.
 * The link that should contain the column as well as the column from the foreign table that
 * it should be based on are contained in the `column` property of the body.
 * Response: [SerializedColumn]{@link SerializedColumn}
 * @tutorial
 * ```
 * - Body: {
 *     column: {@type {LookupColumnSpecifier}}
 * }
 * ```
 */
const POST = withCatchingAPIRoute(async (req, res, tableId: TableId) => {
    const { column } = req.body as { column: LookupColumnSpecifier }
    const user = req.session.user!

    const newColumn = await withReadWriteConnection(user, async connectionId =>
        coreRequest<SerializedColumn>(
            createLookupColumn(connectionId, tableId, column),
            user.authCookie
        )
    )

    res.status(200).json(newColumn)
})

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        const { query } = req
        const tableId = parseInt(query.tableId as string)

        switch (req.method) {
            case "POST":
                await POST(req, res, tableId)
                break
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
