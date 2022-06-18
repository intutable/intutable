import { ColumnType } from "@intutable/database/dist/column"
import {
    addJoinToView,
    getViewInfo,
    JoinDescriptor,
    selectable,
    viewId,
    ViewInfo,
} from "@intutable/lazy-views"
import { createColumnInTable } from "@intutable/project-management/dist/requests"
import { ColumnDescriptor as PM_Column } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import { project_management_constants } from "types/type-annotations/project-management"
import makeForeignKeyName from "utils/makeForeignKeyName"
import { linkColumnAttributes } from "@backend/defaults"
import { addColumnToTable } from "@backend/requests"

/**
 * Add a link from one table view to another. The target table will be
 * represented by its user primary column, and the latter also provides
 * an "add more linked columns" feature in its context menu.
 * This requires creating an extra FK column in the underlying table. The join
 * and the FK can be deleted by deleting the column that represents the link.
 * @tutorial
 * ```
 * - Body: {
 *   tableId: {@type number} The ID of the table in which to create the link.
 *   foreignViewId {@type number} The ID of the table to which the link points.
 * }
 * ```
 */
const POST = withCatchingAPIRoute(async (req, res) => {
    const { tableId, foreignTableId } = req.body as {
        tableId: number
        foreignTableId: number
    }
    const user = req.session.user!

    const tableInfo = await coreRequest<ViewInfo>(
        getViewInfo(tableId),
        user.authCookie
    )

    // create foreign key column
    const fkColumn = await coreRequest<PM_Column>(
        createColumnInTable(
            selectable.getId(tableInfo.source),
            makeForeignKeyName(tableInfo),
            ColumnType.integer
        ),
        user.authCookie
    )

    const foreignTableInfo = await coreRequest<ViewInfo>(
        getViewInfo(foreignTableId),
        user.authCookie
    )

    const foreignIdColumn = foreignTableInfo.columns.find(
        c => c.name === project_management_constants.UID_KEY
    )!
    const primaryColumn = foreignTableInfo.columns.find(
        c => c.attributes.userPrimary! === 1
    )!
    const displayName = (primaryColumn.attributes.displayName ||
        primaryColumn.name) as string
    const join = await coreRequest<JoinDescriptor>(
        addJoinToView(tableId, {
            foreignSource: viewId(foreignTableId),
            on: [fkColumn.id, "=", foreignIdColumn.id],
            columns: [],
        }),
        user.authCookie
    )

    const attributes = linkColumnAttributes(displayName)

    // create representative link column
    await coreRequest(
        addColumnToTable(
            tableId,
            { parentColumnId: primaryColumn.id, attributes },
            join.id
        ),
        user.authCookie
    )

    res.status(200).json(join)
})

export default withSessionRoute(
    withUserCheck(async (req, res) => {
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
