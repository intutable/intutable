import {
    deleteView,
    getViewData,
    getViewOptions,
    listViews,
    renameView,
    ViewData,
    ViewDescriptor,
    ViewOptions,
    asView,
    isTable,
} from "@intutable/lazy-views"
import { coreRequest } from "api/utils"
import { View } from "api/utils/parse"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/error-handling/utils/makeError"
import { withUserCheck } from "utils/withUserCheck"

/**
 * GET a single filter view's data {@type {TableData.Serialized}}.
 *
 * @tutorial
 * ```
 * - URL: `/api/view/[viewId]` e.g. `/api/view/13`
 * - Body: {}
 * ```
 */
const GET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    viewId: ViewDescriptor["id"]
) => {
    try {
        const user = req.session.user!
        const options = await coreRequest<ViewOptions>(
            getViewOptions(viewId),
            user.authCookie
        )
        const tableData = await coreRequest<ViewData>(
            getViewData(viewId),
            user.authCookie
        )

        // parse it
        const parsedData = View.parse(options, tableData)

        res.status(200).json(parsedData)
    } catch (err) {
        const error = makeError(err)
        console.log(error.toString())
        res.status(500).json({ error: error.message })
    }
}

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
        const { newName } = req.body as {
            newName: ViewDescriptor["name"]
        }
        const user = req.session.user!

        // check if name is taken
        const options = await coreRequest<ViewOptions>(
            getViewOptions(viewId),
            user.authCookie
        )
        const otherViews = await coreRequest<ViewDescriptor[]>(
            listViews(asView(options.source)),
            user.authCookie
        )
        const isTaken = otherViews
            .map(view => view.name.toLowerCase())
            .includes(newName.toLowerCase())

        if (isTaken) throw new Error("alreadyTaken")
        else {
            const updatedView = await coreRequest<ViewDescriptor>(
                renameView(viewId, newName),
                user.authCookie
            )
            res.status(200).json(updatedView)
        }
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

/**
 * DELETE a view. Returns an empty object.
 *
 * @tutorial
 * ```
 * - URL: `/api/view/[viewId]` e.g. `/api/view/1`
 * - Body: {}
 * ```
 */
const DELETE = async (
    req: NextApiRequest,
    res: NextApiResponse,
    viewId: ViewDescriptor["id"]
) => {
    try {
        const user = req.session.user!

        const options = await coreRequest<ViewOptions>(
            getViewOptions(viewId),
            user.authCookie
        )

        /**
         * If the view's source is a table, it must be a table view, and you
         * can only delete those through their dedicated endpoint.
         */
        if (isTable(options.source))
            throw Error("deleteTableThroughViewEndpoint")

        await coreRequest(deleteView(viewId), user.authCookie)
        console.log("deleted view " + viewId)

        res.status(200).send({})
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
