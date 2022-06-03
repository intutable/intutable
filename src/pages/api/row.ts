import { deleteRow, insert, update } from "@intutable/database/dist/requests"
import { TableDescriptor } from "@intutable/project-management/dist/types"
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
    const { table, values } = req.body as {
        table: TableDescriptor
        values: Obj
    }

    // create row in database
    const rowId = await coreRequest<
        typeof project_management_constants.UID_KEY
    >(
        insert(table.key, values, [project_management_constants.UID_KEY]),
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

    await coreRequest(
        deleteRow(table.key, condition),
        req.session.user!.authCookie
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
