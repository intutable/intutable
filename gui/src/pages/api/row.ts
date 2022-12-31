import { deleteRow, update } from "@intutable/database/dist/requests"
import { getTableData } from "@intutable/project-management/dist/requests"
import { TableDescriptor, TableData } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { Row, ViewId } from "types"
import { RowInsertData } from "@backend/types/requests"
import { createRow } from "@backend/requests"
import Obj from "types/Obj"

// Intermediate type representing a row whose index is to be changed.
type IndexChange = {
    _id: number
    index: number
    oldIndex: number
}

// compare two rows by index
const byIndex = (a: Obj, b: Obj) => ((a.index as number) > (b.index as number) ? 1 : -1)

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
        viewId: ViewId
        values: RowInsertData
        atIndex?: number
    }
    const user = req.session.user!

    const rowWithId = await withReadWriteConnection(user, async connectionId => {
        return coreRequest<{ _id: number }>(createRow(connectionId, viewId, { atIndex, values }), user.authCookie)
    })

    res.status(200).send(rowWithId["_id"])
})

/**
 * Update a row, identified by `condition`. Ensuring that the types of
 * `values` match up with what the table can take is up to the user.
 * @tutorial
 * ```
 * Body: {
 *    table: {@type {TableDescriptor}}
 *    condition: {@type {Array<unknown>}}
 *    values: {@type {Record<string, unknown>}}
 * }
 * ```
 */
const PATCH = withCatchingAPIRoute(async (req, res) => {
    const {
        table,
        condition,
        update: rowUpdate,
    } = req.body as {
        table: TableDescriptor
        condition: unknown[]
        update: { [index: string]: unknown }
    }

    const user = req.session.user!
    const updatedRow = await withReadWriteConnection(user, async sessionID => {
        return coreRequest<Row>(
            update(sessionID, table.key, {
                condition,
                update: rowUpdate,
            }),
            user.authCookie
        )
    })

    res.status(200).json(updatedRow)
})

/**
 * Delete a row, identified by `condition`.
 * @tutorial
 * ```
 * Body: {
 *    table: {@type {TableDescriptor}}
 *    condition: {@type {Array<unknown>}}
 * }
 * ```
 */
const DELETE = withCatchingAPIRoute(async (req, res) => {
    const { table, condition } = req.body as {
        table: TableDescriptor
        condition: unknown[]
    }
    const user = req.session.user!

    await withReadWriteConnection(user, async sessionID => {
        await coreRequest(deleteRow(sessionID, table.key, condition), user.authCookie)
        // shift indices
        const newData = await coreRequest<TableData<unknown>>(getTableData(sessionID, table.id), user.authCookie)

        const rows = newData.rows as Row[]
        const newIndices: IndexChange[] = rows
            .sort(byIndex)
            .map((row: Row, newIndex: number) => ({
                _id: row._id as number,
                oldIndex: row.index as number,
                index: newIndex,
            }))
            .filter(row => row.oldIndex !== row.index)

        await Promise.all(
            newIndices.map(async ({ _id, index }) =>
                coreRequest(
                    update(sessionID, table.key, {
                        update: { index: index },
                        condition: ["_id", _id],
                    }),
                    user.authCookie
                )
            )
        )
    })

    res.status(200).json({})
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
                res.status(["HEAD", "GET"].includes(req.method!) ? 500 : 501).send("This method is not supported!")
        }
    })
)
