import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { ViewId, TableId } from "types"
import { RowData } from "../../../../../libs/dekanat-app-plugin/dist/types/requests"
import {
    createRow,
    updateRows,
    deleteRows,
} from "../../../../../libs/dekanat-app-plugin/dist/requests"

/**
 * Create a new row. All user-side values will be initialized empty, unless values are
 * supplied in the form of body.values - these are a dictionary where the keys are the IDs of
 * the columns in the view indicated by body.viewId. An index to insert the row at can be
 * supplied with body.atIndex.
 * @tutorial
 * ```
 * Body: {
 *    view: {@type {ViewId}}
 *    values: {@type {RowInsertData}}
 *    atIndex: number
 * }
 * ```
 */
const POST = withCatchingAPIRoute(async (req, res) => {
    const { viewId, values, atIndex } = req.body as {
        viewId: ViewId | TableId
        values: RowData
        atIndex?: number
    }
    const user = req.session.user!

    const rowWithId = await withReadWriteConnection(user, async connectionId => {
        return coreRequest<{ _id: number }>(
            createRow(connectionId, viewId, { atIndex, values }),
            user.authCookie
        )
    })

    res.status(200).json(rowWithId["_id"])
})

/**
 * Update a row, identified by `rowsToUpdate`. 
`* @param {TableId | ViewId} viewId - can refer to either a table or a view.
 * Beware, however, as one column will have its own metadata entity in a table, and another
 * in every view on that table, each with different IDs.
 * So the column IDs used as keys in the {@link RowData} must match the IDs of the columns
 * in the table or view that is referenced by `viewId`. This should normally be pretty hard to
 * get wrong, but it will be quite hard to debug if you do.
 * This sounds weird, but the old set-up actually required the front-end to look into a view's
 * backend-side metadata columns and figure out the right SQL column name so it could
 * manually construct an update that would be passed directly to SQL. We also eventually want
 * to introduce n-tier views (like view -> ... -> view -> table) which are now already supported
 * by this update method.
 * @param {number | number[]} rowsToUpdate - pass in either the ID of a row to update
 * or an array of IDs to update multiple rows.
 * @return {{ rowsUpdated: number }} how many rows were updated.
 * @tutorial
 * ```
 * Body: {
 *    viewId: {@type {TableId | ViewId}}
 *    condition: {@type {number | number[]}}
 *    values: {@type {RowData}}
 * }
 * ```
 */
const PATCH = withCatchingAPIRoute(async (req, res) => {
    const { viewId, rowsToUpdate, values } = req.body as {
        viewId: TableId | ViewId
        rowsToUpdate: number | number[]
        values: RowData
    }

    const user = req.session.user!
    const { rowsUpdated } = await withReadWriteConnection(user, async connectionId => {
        return coreRequest<{ rowsUpdated: number }>(
            updateRows(connectionId, viewId, rowsToUpdate, values),
            user.authCookie
        )
    })

    res.status(200).json({ rowsUpdated })
})

/**
 * Delete a row, identified by `condition`.
 * @return { rowsDeleted: number } how many rows were deleted.
 * @tutorial
 * ```
 * Body: {
 *    table: {@type {TableDescriptor}}
 *    condition: {@type {Array<unknown>}}
 * }
 * ```
 */
const DELETE = withCatchingAPIRoute(async (req, res) => {
    const { viewId, rowsToDelete } = req.body as {
        viewId: ViewId | TableId
        rowsToDelete: number | number[] // <- ids – not indices!
    }
    const user = req.session.user!

    const { rowsDeleted } = await withReadWriteConnection(user, async connectionId => {
        return coreRequest<{ rowsDeleted: number }>(
            deleteRows(connectionId, viewId, rowsToDelete),
            user.authCookie
        )
    })

    res.status(200).json({ rowsDeleted })
})

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        switch (req.method) {
            case "POST":
                await POST(req, res)
                break
            case "PATCH":
                await PATCH(req, res)
                break
            case "DELETE":
                await DELETE(req, res)
                break
            default:
                res.status(["HEAD", "GET"].includes(req.method!) ? 500 : 501).send(
                    "This method is not supported!"
                )
        }
    })
)
