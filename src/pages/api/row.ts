import { deleteRow, insert, update } from "@intutable/database/dist/requests"
import { TableDescriptor } from "@intutable/join-tables/dist/types"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PM, Row } from "types"
import Obj from "types/Obj"
import { makeError } from "utils/makeError"
import { withUserCheck } from "utils/withUserCheck"

/**
 * Create a new row with some starting values. Ensuring that the types of
 * `values` match up with what the table can take is up to the user.
 * @tutorial
 * ```
 * Body: {
 *    baseTable: {@type {TableDescriptor}}
 *    values: {@type {Record<string, unknown>}}
 * }
 * ```
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { baseTable, values } = req.body as {
            baseTable: TableDescriptor
            values: Obj
        }

        // create row in database
        const rowId = await coreRequest<typeof PM.UID_KEY>(
            insert(baseTable.key, values, [PM.UID_KEY]),
            req.session.user!.authCookie
        )

        res.status(200).send(rowId)
    } catch (err) {
        console.error(err)
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
 *    baseTable: {@type {TableDescriptor}}
 *    condition: {@type {Array<unknown>}}
 *    values: {@type {Record<string, unknown>}}
 * }
 * ```
 */
const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const {
            baseTable,
            condition,
            update: rowUpdate,
        } = req.body as {
            baseTable: TableDescriptor
            condition: unknown[]
            update: { [index: string]: unknown }
        }

        const updatedRow = await coreRequest<Row>(
            update(baseTable.key, {
                condition,
                update: rowUpdate,
            }),
            req.session.user!.authCookie
        )

        res.status(200).json(updatedRow)
    } catch (err) {
        console.error(err)
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}
/**
 * Delete a row, identified by `condition`.
 * @tutorial
 * ```
 * Body: {
 *    baseTable: {@type {TableDescriptor}}
 *    condition: {@type {Array<unknown>}}
 * }
 * ```
 */
const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { baseTable, condition } = req.body as {
            baseTable: TableDescriptor
            condition: unknown[]
        }

        await coreRequest(
            deleteRow(baseTable.key, condition),
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
