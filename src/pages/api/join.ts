import { ColumnType } from "@intutable/database/dist/column"
import { addJoinToJt, getJtInfo } from "@intutable/join-tables/dist/requests"
import { JoinDescriptor, JtInfo } from "@intutable/join-tables/dist/types"
import { createColumnInTable } from "@intutable/project-management/dist/requests"
import { ColumnDescriptor as PM_Column } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PM } from "types"
import { makeError } from "utils/makeError"
import makeForeignKeyName from "utils/makeForeignKeyName"
import { withUserCheck } from "utils/withUserCheck"

/**
 * Add a link from one join table to another. The target table will be
 * represented by its user primary column, and the latter also provides
 * an "add more linked columns" feature in its context menu.
 * This requires creating an extra FK column in the underlying table. The join
 * and the FK can be deleted by deleting the column that represents the link.
 * @tutorial
 * ```
 * - Body: {
 *   jtId: {@type number} The ID of the JT in which to create the link.
 *   foreignJtId {@type number} The ID of the JT to which the link points.
 * }
 * ```
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { jtId, foreignJtId } = req.body as {
            jtId: number
            foreignJtId: number
        }
        const user = req.session.user!

        const jtInfo = await coreRequest<JtInfo>(
            getJtInfo(jtId),
            user.authCookie
        )

        // create foreign key column
        const fkColumn = await coreRequest<PM_Column>(
            createColumnInTable(
                jtInfo.baseTable.id,
                makeForeignKeyName(jtInfo),
                ColumnType.integer
            ),
            user.authCookie
        )

        const foreignJtInfo = await coreRequest<JtInfo>(
            getJtInfo(foreignJtId),
            user.authCookie
        )

        const foreignIdColumn = foreignJtInfo.columns.find(
            c => c.name === PM.UID_KEY
        )!
        const primaryColumn = foreignJtInfo.columns.find(
            c => c.attributes.userPrimary! === 1
        )!
        const displayName = (primaryColumn.attributes.displayName ||
            primaryColumn.name) as string
        const join = await coreRequest<JoinDescriptor>(
            addJoinToJt(jtId, {
                foreignJtId,
                on: [fkColumn.id, "=", foreignIdColumn.id],
                columns: [
                    {
                        parentColumnId: primaryColumn.id,
                        attributes: {
                            displayName,
                            editable: 0,
                            editor: null,
                            formatter: "linkColumn",
                        },
                    },
                ],
            }),
            user.authCookie
        )
        res.status(200).json(join)
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
