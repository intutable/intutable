import {
    Condition,
    ViewDescriptor,
    ViewOptions,
    getViewOptions,
    changeRowOptions,
} from "@intutable/lazy-views"

import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/error-handling/utils/makeError"
import { withUserCheck } from "api/utils/withUserCheck"
import { defaultViewName } from "@backend/defaults"

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
const PATCH = async (
    req: NextApiRequest,
    res: NextApiResponse,
    viewId: ViewDescriptor["id"]
) => {
    try {
        const { filters } = req.body as {
            filters: Condition[]
        }
        const user = req.session.user!

        const options = await coreRequest<ViewOptions>(
            getViewOptions(viewId),
            user.authCookie
        )

        // prevent altering the default view
        if (options.name === defaultViewName()) throw Error("changeDefaultView")

        const newRowOptions = {
            ...options.rowOptions,
            conditions: filters,
        }

        await coreRequest(
            changeRowOptions(viewId, newRowOptions),
            user.authCookie
        )

        res.status(200).json({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

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
