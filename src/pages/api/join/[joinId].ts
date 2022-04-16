import type { NextApiRequest, NextApiResponse } from "next"

import { update } from "@intutable/database/dist/requests"
import { TableInfo } from "@intutable/project-management/dist/types"
import { getTableInfo } from "@intutable/project-management/dist/requests"
import {
    JtDescriptor,
    JoinDescriptor,
    JtInfo,
} from "@intutable/join-tables/dist/types"
import { getJtInfo } from "@intutable/join-tables/dist/requests"

import { PM } from "types"
import { coreRequest } from "api/utils"
import { makeError } from "utils/makeError"
import { withSessionRoute } from "auth"
import { withUserCheck } from "utils/withUserCheck"

/**
 * Link rows in linked tables, by setting the value in the linking table's
 * foreign key column.
 * @tutorial
 * ```
 * - URL: `/api/join/[id]`, e.g. `/api/join/3`
 * - Body: {
 *    jtId: {@type {number} The ID of the JT in which to create the link.
 *    rowId: {@type {number}} Row of the linking table.
 *    value: {@type {number}} The ID of the row in the linked table.
 * }
 * ```
 */
const POST = async (
    req: NextApiRequest,
    res: NextApiResponse,
    joinId: JoinDescriptor["id"]
) => {
    try {
        const { jtId, rowId, value } = req.body as {
            jtId: JtDescriptor["id"]
            rowId: number
            value: number
        }
        const user = req.session.user!

        const jtInfo = await coreRequest<JtInfo>(
            getJtInfo(jtId),
            user.authCookie
        )
        const baseTableInfo = await coreRequest<TableInfo>(
            getTableInfo(jtInfo.baseTable.id),
            user.authCookie
        )

        const join = jtInfo.joins.find(j => j.id === joinId)!

        const fkColumn = baseTableInfo.columns.find(c => c.id === join.on[0])!

        await coreRequest(
            update(jtInfo.baseTable.key, {
                condition: [PM.UID_KEY, rowId],
                update: { [fkColumn.name]: value },
            }),
            user.authCookie
        )

        res.status(200).json({})
    } catch (err) {
        const error = makeError(err)
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}

export default withSessionRoute(
    withUserCheck(async (req: NextApiRequest, res: NextApiResponse) => {
        const { query } = req
        const joinId = parseInt(query.joinId as string)

        switch (req.method) {
            case "POST":
                await POST(req, res, joinId)
                break
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
