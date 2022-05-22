import { ColumnType } from "@intutable/database/dist/column"
import {
    addJoinToView,
    getViewInfo,
    JoinDescriptor,
    selectable,
    viewId as mkViewId,
    ViewInfo,
} from "@intutable/lazy-views"
import { createColumnInTable } from "@intutable/project-management/dist/requests"
import { ColumnDescriptor as PM_Column } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { project_management_constants } from "types/type-annotations/project-management"
import { makeError } from "utils/error-handling/utils/makeError"
import makeForeignKeyName from "utils/makeForeignKeyName"
import { withUserCheck } from "utils/withUserCheck"

/**
 * Add a link from one table view to another. The target table will be
 * represented by its user primary column, and the latter also provides
 * an "add more linked columns" feature in its context menu.
 * This requires creating an extra FK column in the underlying table. The join
 * and the FK can be deleted by deleting the column that represents the link.
 * @tutorial
 * ```
 * - Body: {
 *   mkViewId: {@type number} The ID of the view in which to create the link.
 *   foreignViewId {@type number} The ID of the view to which the link points.
 * }
 * ```
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { viewId, foreignViewId } = req.body as {
            viewId: number
            foreignViewId: number
        }
        const user = req.session.user!

        const viewInfo = await coreRequest<ViewInfo>(
            getViewInfo(viewId),
            user.authCookie
        )

        // create foreign key column
        const fkColumn = await coreRequest<PM_Column>(
            createColumnInTable(
                selectable.getId(viewInfo.source),
                makeForeignKeyName(viewInfo),
                ColumnType.integer
            ),
            user.authCookie
        )

        const foreignViewInfo = await coreRequest<ViewInfo>(
            getViewInfo(foreignViewId),
            user.authCookie
        )

        const foreignIdColumn = foreignViewInfo.columns.find(
            c => c.name === project_management_constants.UID_KEY
        )!
        const primaryColumn = foreignViewInfo.columns.find(
            c => c.attributes.userPrimary! === 1
        )!
        const displayName = (primaryColumn.attributes.displayName ||
            primaryColumn.name) as string
        const join = await coreRequest<JoinDescriptor>(
            addJoinToView(viewId, {
                foreignSource: mkViewId(foreignViewId),
                on: [fkColumn.id, "=", foreignIdColumn.id],
                columns: [
                    {
                        parentColumnId: primaryColumn.id,
                        attributes: {
                            displayName,
                            editable: 1,
                            editor: "string",
                            formatter: "standard",
                            _kind: "link",
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
