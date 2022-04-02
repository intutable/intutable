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
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import { makeError } from "utils/makeError"

/**
 * Add a link from one join table to another. The target table will be
 * represented by its user primary column, and the latter also provides
 * an "add more linked columns" feature in its context menu.
 * body: {
 *   jtId: {@type number} The ID of the JT in which to create the link.
 *   foreignJtId {@type number} The ID of the JT to which the link points.
 * }
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

        console.log(joinId, jtId, rowId, value)
        const jtInfo = await coreRequest<JtInfo>(
            getJtInfo(jtId),
            req.cookies[AUTH_COOKIE_KEY]
        )
        const baseTableInfo = await coreRequest<TableInfo>(
            getTableInfo(jtInfo.baseTable.id),
            req.cookies[AUTH_COOKIE_KEY]
        )

        const join = jtInfo.joins.find(j => j.id === joinId)!

        const fkColumn = baseTableInfo.columns.find(c => c.id === join.on[0])!

        await coreRequest(
            update(jtInfo.baseTable.key, {
                condition: [PM.UID_KEY, rowId],
                update: { [fkColumn.name]: value },
            }),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).json({})
    } catch (err) {
        const error = makeError(err)
        console.log(error)
        res.status(500).json({ error: error.message })
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { query, method } = req
    const joinId = parseInt(query.joinId as string)

    switch (req.method) {
        case "POST":
            await POST(req, res, joinId)
            break
        default:
            res.setHeader("Allow", ["POST"])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
