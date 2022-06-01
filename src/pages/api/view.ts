import {
    createView,
    viewId,
    getViewInfo,
    listViews,
    ViewInfo,
    ViewDescriptor
} from "@intutable/lazy-views"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/error-handling/utils/makeError"
import {
    defaultRowOptions,
} from "@backend/defaults"
import { withUserCheck } from "utils/withUserCheck"

/**
 * @tutorial
 * ```
 * - Body: {
 *    tableId: {@type {number}}
 *    name: {@type {string}}
 * }
 * ```
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { tableViewId, name } = req.body as {
            tableViewId: ViewDescriptor["id"]
            name: string
        }
        const user = req.session.user!

        // avoid duplicates
        const existingViews = await coreRequest<ViewDescriptor[]>(
            listViews(viewId(tableViewId)),
            user.authCookie
        )
        if (existingViews.some(v => v.name === name))
            throw Error("alreadyTaken")

        // create new filter view
        const tableColumns = await coreRequest<ViewInfo>(
            getViewInfo(tableViewId),
            user.authCookie
        ).then(i => i.columns)
        const filterView = await coreRequest<ViewDescriptor>(
            createView(
                viewId(tableViewId),
                name,
                { columns: [], joins: [] },
                defaultRowOptions(tableColumns),
                user.id
            ),
            user.authCookie
        )

        res.status(200).json(filterView)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

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
