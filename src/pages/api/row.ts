import { deleteRow, insert, update } from "@intutable/database/dist/requests"
import { TableDescriptor } from "@intutable/join-tables/dist/types"
import { coreRequest } from "api/utils"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import type { NextApiRequest, NextApiResponse } from "next"
import { PM as PMKeys, PMTypes as PM, Row } from "types"
import Obj from "types/Obj"
import { makeError } from "utils/makeError"

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { baseTable, values } = req.body as {
            baseTable: TableDescriptor
            values: Obj
        }

        // create row in database
        const rowId = await coreRequest<typeof PMKeys.UID_KEY>(
            insert(baseTable.key, values),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).send(rowId)
    } catch (err) {
        console.error(err)
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        console.log("body; " + JSON.stringify(req.body))
        const { baseTable, condition, update: rowUpdate } = req.body as {
            baseTable: TableDescriptor
            condition: unknown[]
            update: { [index: string]: unknown }
        }

        const updatedRow = await coreRequest<Row>(
            update(baseTable.key, {
                condition,
                update: rowUpdate,
            }),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).json(updatedRow)
    } catch (err) {
        console.error(err)
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { baseTable, condition } = req.body as {
            baseTable: TableDescriptor
            condition: unknown[]
        }

        await coreRequest(
            deleteRow(baseTable.key, condition),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).send({})
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
}
