import {
    JtDescriptor,
    JtInfo,
    ColumnSpecifier,
    ColumnDescriptor,
} from "@intutable/join-tables/dist/types"
import { addColumnToJt, getJtInfo } from "@intutable/join-tables/dist/requests"
import { coreRequest } from "api/utils"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"
import { withSessionRoute } from "auth"
import { withUserCheck } from "utils/withUserCheck"

/**
 * Add a lookup field from a linked table.
 * @tutorial
 * ```
 * - Body: {
 *     jtId: {@type {number}}
 *     joinId: {@type {number}}
 * }
 * ```
 */
const POST = async (
    req: NextApiRequest,
    res: NextApiResponse,
    columnId: ColumnDescriptor["id"]
) => {
    try {
        const { jtId, joinId } = req.body as {
            jtId: JtDescriptor["id"]
            joinId: Exclude<ColumnDescriptor["joinId"], null>
        }
        const user = req.session.user!

        const jtInfo = await coreRequest<JtInfo>(
            getJtInfo(jtId),
            user.authCookie
        )

        const foreignJtInfo = await coreRequest<JtInfo>(
            getJtInfo(jtInfo.joins.find(j => j.id === joinId)!.foreignJtId),
            user.authCookie
        )

        const foreignColumn = foreignJtInfo.columns.find(
            c => c.id === columnId
        )!
        const displayName =
            foreignColumn.attributes.displayName || foreignColumn.name

        const columnSpec: ColumnSpecifier = {
            parentColumnId: columnId,
            attributes: {
                displayName,
                editable: 0,
                editor: "string",
                formatter: "string",
            },
        }

        const newColumn = await coreRequest<ColumnDescriptor>(
            addColumnToJt(jtId, columnSpec, joinId),
            user.authCookie
        )

        res.status(200).json(newColumn)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default withSessionRoute(
    withUserCheck(async (req: NextApiRequest, res: NextApiResponse) => {
        const { query } = req
        const columnId = parseInt(query.columnId as string)

        switch (req.method) {
            case "POST":
                await POST(req, res, columnId)
                break
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
