import {
    ColumnInfo,
    ViewInfo,
    addColumnToView,
    getViewInfo,
} from "@intutable/lazy-views"
import { coreRequest } from "api/utils/coreRequest"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/error-handling/utils/makeError"
import { withUserCheck } from "utils/withUserCheck"

/**
 * Add a new linked column to a join. Its contents will be taken from the
 * linked table.
 * @tutorial
 * ```
 * - Body: {
 *    viewId: {@type {number}},
 *    parentColumnId: {@type {number}},
 *    joinId: {@type {number}}
 * }
 * ```
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { viewId, parentColumnId, joinId } = req.body as {
            viewId: number
            parentColumnId: number
            joinId: number
        }

        const info = await coreRequest<ViewInfo>(
            getViewInfo(viewId),
            req.session.user!.authCookie
        )

        const parentColumn = info.columns.find(
            (c: ColumnInfo) => c.id === parentColumnId
        )

        if (!parentColumn) {
            throw Error(
                `view #${viewId} has no column` + ` named #${parentColumnId}`
            )
        } else if (parentColumn.joinId !== joinId) {
            throw Error(
                `column #${parentColumnId} does not belong to join` +
                    ` #${joinId}`
            )
        } else {
            const columnSpec = {
                parentColumnId,
                attributes: {
                    displayName: parentColumn.attributes.displayName!,
                },
            }
            const newColumn = await coreRequest<ColumnInfo>(
                addColumnToView(viewId, columnSpec, joinId),
                req.session.user!.authCookie
            )

            res.status(200).json(newColumn)
        }
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
