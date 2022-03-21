import { TableDescriptor } from "@intutable/project-management/dist/types"
import { createJt } from "@intutable/join-tables/dist/requests"
import {
    ColumnOptions,
    JtDescriptor,
    RowOptions,
} from "@intutable/join-tables/dist/types"
import { createTableInProject } from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PMTypes as PM } from "types"
import { makeError } from "utils/makeError"

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, project, name, columnOptions, rowOptions } = req.body as {
            user: User
            project: PM.Project
            name: PM.Table.Name
            columnOptions: ColumnOptions
            rowOptions: RowOptions
        }

        // create table in project-management
        const table = await coreRequest<TableDescriptor>(
            createTableInProject(user.id, project.id, name),
            user.authCookie
        )

        // create table in join-tables
        const jtTable = await coreRequest<JtDescriptor>(
            createJt(table.id, table.name, columnOptions, rowOptions, user.id),
            user.authCookie
        )

        res.status(200).json(jtTable)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req

    switch (method) {
        case "POST":
            POST(req, res)
            break
        default:
            res.setHeader("Allow", ["POST"])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
