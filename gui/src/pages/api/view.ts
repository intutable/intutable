import { ViewDescriptor } from "@backend/types/index"
import { createView } from "@backend/requests"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { withUserCheck } from "api/utils/withUserCheck"

/**
 * @tutorial
 * ```
 * - Body: {
 *    tableId: {@type {number}}
 *    name: {@type {string}}
 * }
 * ```
 */
const POST = withCatchingAPIRoute(
    async (req: NextApiRequest, res: NextApiResponse) => {
        const { tableId, name } = req.body as {
            tableId: ViewDescriptor["id"]
            name: string
        }
        const user = req.session.user!

        const filterView = await withReadWriteConnection(
            user,
            async sessionID =>
                coreRequest<ViewDescriptor>(
                    createView(sessionID, user.id, tableId, name),
                    user.authCookie
                )
        )

        res.status(200).json(filterView)
    }
)

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
