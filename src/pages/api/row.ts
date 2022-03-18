import { CHANNEL, METHOD } from "api/constants"
import { coreRequest } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PMTypes as PM, Row, PM as PMKeys } from "types"
import { insert, update, deleteRow } from "@intutable/database/dist/requests"
import {
    createTableInProject,
    removeTable,
} from "@intutable/project-management/dist/requests"
import {
    createJt,
    renameJt,
    deleteJt,
    getJtData,
} from "@intutable/join-tables/dist/requests"
import {
    ColumnOptions,
    JtDescriptor,
    RowOptions,
    JtData,
    TableDescriptor,
} from "@intutable/join-tables/dist/types"
import { makeError } from "utils/makeError"
import Obj from "types/Obj"

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, basetable, values } = req.body as {
            user: User
            table: PM.Table
            basetable: TableDescriptor
            values: Obj
        }

        // create row in database
        const rowId = await coreRequest<typeof PMKeys.UID_KEY>(
            CHANNEL.DATABASE,
            insert.name,
            insert(basetable.key, {
                table: `key`,
                values,
            }),
            user.authCookie
        )

        res.status(200).send(rowId)
    } catch (err) {
        const error = makeError(err)
        res.status(500).send(error.message)
    }
}

const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, basetable, condition, rowUpdate } = req.body as {
            user: User
            basetable: TableDescriptor
            newName: PM.Table.Name
            condition: unknown[]
            rowUpdate: { [index: string]: unknown }
        }

        const updatedRow = await coreRequest<Row>(
            CHANNEL.DATABASE,
            update.name,
            update(basetable.key, {
                condition,
                update: rowUpdate,
            }),
            user.authCookie
        )

        res.status(200).json(updatedRow)
    } catch (err) {
        const error = makeError(err)
        res.status(500).send(error.message)
    }
}

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, basetable, condition } = req.body as {
            user: User
            basetable: TableDescriptor
            condition: unknown[]
        }

        await coreRequest(
            CHANNEL.DATABASE,
            deleteRow.name,
            deleteRow(basetable.key, condition),
            user.authCookie
        )

        res.status(200).send({})
    } catch (err) {
        const error = makeError(err)
        res.status(500).send(error.message)
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "POST":
            POST(req, res)
            break
        case "PATCH":
            PATCH(req, res)
            break
        case "DELETE":
            DELETE(req, res)
            break
        default:
            res.status(["HEAD", "GET"].includes(req.method!) ? 500 : 501).send(
                "This method is not supported!"
            )
    }
}
