import type { NextApiRequest, NextApiResponse } from "next"

import { JtInfo, ColumnDescriptor } from "@intutable/join-tables/dist/types"
import { getJtInfo, addColumnToJt } from "@intutable/join-tables/dist/requests"

import { coreRequest } from "api/utils/coreRequest"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import { makeError } from "utils/makeError"

/**
 * Add a new linked column to a join. Its contents will be taken from the
 * linked table.
 * @tutorial
 * ```
 * - Body: {
 *    jtId: {@type {number}},
 *    parentColumnId: {@type {number}},
 *    joinId: {@type {number}}
 * }
 * ```
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { jtId, parentColumnId, joinId } = req.body as {
            jtId: number
            parentColumnId: number
            joinId: number
        }

        const info = await coreRequest<JtInfo>(
            getJtInfo(jtId),
            req.cookies[AUTH_COOKIE_KEY]
        )

        const parentColumn = info.columns.find(c => c.id === parentColumnId)

        if (!parentColumn) {
            throw Error(`join table #${jtId} has no columnd #${parentColumnId}`)
        } else if (parentColumn.joinId !== joinId){
            throw Error(`column #${parentColumnId} does not belong to join`
                + ` #${joinId}`)
        } else {
            const columnSpec = {
                parentColumnId,
                attributes: {
                    displayName: parentColumn.attributes.displayName!
                }
            }
            const newColumn = await coreRequest<ColumnDescriptor>(
                addColumnToJt(jtId, columnSpec, joinId),
                req.cookies[AUTH_COOKIE_KEY]
            )

            res.status(200).json(newColumn)
        }
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case "POST":
            await POST(req, res)
            break
        default:
            res.setHeader("Allow", ["POST"])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
