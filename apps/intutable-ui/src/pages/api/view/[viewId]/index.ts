import { ViewData } from "types/tables"
import { ViewDescriptor } from "@shared/types"
import {
    getViewData,
    deleteView,
    renameView,
} from "../../../../../../../libs/dekanat-app-plugin/dist/requests"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import { withReadWriteConnection, withReadOnlyConnection } from "api/utils/databaseConnection"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import type { NextApiRequest, NextApiResponse } from "next"
import { withUserCheck } from "api/utils/withUserCheck"

/**
 * GET a single filter view's data {@type {ViewData.Serialized}}.
 *
 * @tutorial
 * ```
 * - URL: `/api/view/[viewId]` e.g. `/api/view/13`
 * - Body: {}
 * ```
 */
const GET = withCatchingAPIRoute(
    async (req: NextApiRequest, res: NextApiResponse, viewId: ViewDescriptor["id"]) => {
        const user = req.session.user!

        const data = await withReadOnlyConnection(user, async sessionID =>
            coreRequest<ViewData.Serialized>(getViewData(sessionID, viewId), user.authCookie)
        )

        res.status(200).json(data)
    }
)

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
        const { newName } = req.body as {
            newName: ViewDescriptor["name"]
        }
        const user = req.session.user!

        const updatedView = await withReadWriteConnection(user, async sessionID =>
            coreRequest<ViewDescriptor>(renameView(sessionID, viewId, newName), user.authCookie)
        )
        res.status(200).json(updatedView)
    }
)

/**
 * DELETE a view. Returns an empty object.
 *
 * @tutorial
 * ```
 * - URL: `/api/view/[viewId]` e.g. `/api/view/1`
 * - Body: {}
 * ```
 */
const DELETE = withCatchingAPIRoute(
    async (req: NextApiRequest, res: NextApiResponse, viewId: ViewDescriptor["id"]) => {
        const user = req.session.user!

        await withReadWriteConnection(user, async sessionID =>
            coreRequest<void>(deleteView(sessionID, viewId), user.authCookie)
        )
        res.status(200).send({})
    }
)

export default withSessionRoute(
    withUserCheck(async (req: NextApiRequest, res: NextApiResponse) => {
        const { query, method } = req
        const viewId = parseInt(query.viewId as string)

        switch (method) {
            case "GET":
                await GET(req, res, viewId)
                break
            case "PATCH":
                await PATCH(req, res, viewId)
                break
            case "DELETE":
                await DELETE(req, res, viewId)
                break
            default:
                res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    })
)
