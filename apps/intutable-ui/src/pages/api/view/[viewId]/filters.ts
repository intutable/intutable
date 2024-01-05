import { ViewDescriptor } from "@shared/types"
import { changeViewFilters } from "../../../../../../../libs/dekanat-app-plugin/dist/requests"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { Filter } from "types/filter"

/**
 * PATCH/update the name of a single view.
 * Returns the updated filter view {@type {ViewDescriptor}}.
 *
 * ```
 * - URL: `/api/view/[viewId]` e.g. `/api/view/1`
 * - Body: {
 *     newName: {@type {string}}
 *   }
 * ```
 */
const PATCH = withCatchingAPIRoute(
    async (req: NextApiRequest, res: NextApiResponse, viewId: ViewDescriptor["id"]) => {
        const { filters } = req.body as {
            filters: Filter[]
        }
        const user = req.session.user!

        await withReadWriteConnection(user, async sessionID =>
            coreRequest<Filter[]>(
                changeViewFilters(sessionID, viewId, filters),
                user.authCookie
            ).catch(e =>
                e.message.includes("default view")
                    ? Promise.reject("changeDefaultView")
                    : Promise.reject(e)
            )
        )
        res.status(200).json({})
    }
)

export default withSessionRoute(
    withUserCheck(async (req: NextApiRequest, res: NextApiResponse) => {
        const { query, method } = req
        const viewId = parseInt(query.viewId as string)

        switch (method) {
            case "PATCH":
                await PATCH(req, res, viewId)
                break
            default:
                res.setHeader("Allow", ["PATCH"])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    })
)
