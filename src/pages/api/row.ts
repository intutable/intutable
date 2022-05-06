import { deleteRow, insert, update } from "@intutable/database/dist/requests"
import { TableDescriptor } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PM, Row } from "types"
import Obj from "types/Obj"
import { makeError } from "utils/error-handling/utils/makeError"
import { withUserCheck } from "utils/withUserCheck"

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
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { table, values } = req.body as {
            table: TableDescriptor
            values: Obj
        }

        // create row in database
        const rowId = await coreRequest<typeof PM.UID_KEY>(
            insert(table.key, values, [PM.UID_KEY]),
            req.session.user!.authCookie
        )

        res.status(200).send(rowId)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

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
const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
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
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}
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
const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { table, condition } = req.body as {
            table: TableDescriptor
            condition: unknown[]
        }

        await coreRequest(
            deleteRow(table.key, condition),
            req.session.user!.authCookie
        )

        res.status(200).send({})
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
