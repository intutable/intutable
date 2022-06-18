import {
    deleteRow,
    insert,
    select,
    update,
} from "@intutable/database/dist/requests"
import { getTableData } from "@intutable/project-management/dist/requests"
import {
    TableDescriptor,
    TableData,
} from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import { Row } from "types"
import Obj from "types/Obj"
import { project_management_constants } from "types/type-annotations/project-management"

/**
 * Create a new row with some starting values. Ensuring that the types of
 * `values` match up with what the table can take is up to the user.
 * @tutorial
 * ```
 * Body: {
 *    table: {@type {TableDescriptor}}
 *    values: {@type {Record<string, unknown>}}
 * }
 * ```
 */
const POST = withCatchingAPIRoute(async (req, res) => {
    const { table, values, atIndex } = req.body as {
        table: TableDescriptor
        values: Obj
        atIndex?: number
    }
    const user = req.session.user!

    const oldData = await coreRequest<TableData>(
        getTableData(table.id),
        user.authCookie
    )

    console.log("at index:", atIndex)

    // BUG: does not work properly
    let newValues: Obj
    if (atIndex === undefined || atIndex === oldData.rows.length)
        newValues = { ...values, index: oldData.rows.length }
    else {
        newValues = { ...values, index: atIndex }
        const shiftedRows = oldData.rows.slice(atIndex).map((row: Row) => ({
            _id: row._id,
            index: (row.index as number) + 1,
        }))
        Promise.all(
            shiftedRows.map(
                async (row: Obj) =>
                    coreRequest(
                        update(table.key, {
                            condition: ["_id", row._id],
                            update: { index: row.index },
                        })
                    ),
                user.authCookie
            )
        )
    }

    // create row in database
    const rowId = await coreRequest<
        typeof project_management_constants.UID_KEY
    >(
        insert(table.key, newValues, [project_management_constants.UID_KEY]),
        req.session.user!.authCookie
    )

    res.status(200).send(rowId)
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

    const updatedRow = await coreRequest<Row>(
        update(table.key, {
            condition,
            update: rowUpdate,
        }),
        req.session.user!.authCookie
    )

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

    await coreRequest(deleteRow(table.key, condition), user.authCookie)
    // shift indices
    const newData = await coreRequest<TableData>(
        getTableData(table.id),
        user.authCookie
    )
    const newIndices: { _id: number; index: number }[] = newData.rows
        .sort()
        .map((row: Row, newIndex: number) => ({
            _id: row._id as number,
            index: newIndex,
        }))
    await Promise.all(
        newIndices.map(async ({ _id, index }) =>
            update(table.key, {
                update: { index: index },
                condition: ["_id", _id],
            })
        )
    )
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
                res.status(
                    ["HEAD", "GET"].includes(req.method!) ? 500 : 501
                ).send("This method is not supported!")
        }
    })
)
