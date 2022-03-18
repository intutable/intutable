import { CHANNEL, METHOD } from "api/constants"
import { coreRequest } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PMTypes as PM } from "types"
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
} from "@intutable/join-tables/dist/types"
import { makeError } from "utils/makeError"

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, table } = req.body as {
            user: User
            table: PM.Table
        }

        const tableData = await coreRequest<JtData>(
            CHANNEL.JOIN_TABLES,
            getJtData.name,
            getJtData(table.id),
            user.authCookie
        )

        res.status(200).json(tableData)
    } catch (err) {
        const error = makeError(err)
        res.status(500).send(error.message)
    }
}

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, project, tableName, columnOptions, rowOptions } =
            req.body as {
                user: User
                project: PM.Project
                tableName: PM.Table.Name
                columnOptions: ColumnOptions
                rowOptions: RowOptions
            }

        // create table in project-management
        const table = await coreRequest<PM.Table>(
            CHANNEL.PROJECT_MANAGEMENT,
            createTableInProject.name,
            createTableInProject(user.id, project.id, tableName),
            user.authCookie
        )

        // create table in join-tables
        const jtTable = await coreRequest<JtDescriptor>(
            CHANNEL.JOIN_TABLES,
            createJt.name,
            createJt(table.id, table.name, columnOptions, rowOptions, user.id),
            user.authCookie
        )

        res.status(200).json(jtTable)
    } catch (err) {
        const error = makeError(err)
        res.status(500).send(error.message)
    }
}

const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, table, newName } = req.body as {
            user: User
            table: PM.Table
            newName: PM.Table.Name
        }

        // rename table in join-tables
        const updatedTable = await coreRequest<PM.Table>(
            CHANNEL.JOIN_TABLES,
            renameJt.name,
            renameJt(table.id, newName),
            user.authCookie
        )

        res.status(200).json(updatedTable)
    } catch (err) {
        const error = makeError(err)
        res.status(500).send(error.message)
    }
}

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, table } = req.body as {
            user: User
            table: PM.Table
        }

        // delete table in project-management
        await coreRequest(
            CHANNEL.PROJECT_MANAGEMENT,
            removeTable.name,
            removeTable(table.id),
            user.authCookie
        )

        // delete table in join-tables
        await coreRequest(
            CHANNEL.JOIN_TABLES,
            deleteJt.name,
            deleteJt(table.id),
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
        case "GET":
            GET(req, res)
            break
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
            res.status(req.method === "HEAD" ? 500 : 501).send(
                "This method is not supported!"
            )
    }
}
