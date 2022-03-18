import { CHANNEL, METHOD } from "api/constants"
import { coreRequest } from "api/utils"
import type { NextApiRequest, NextApiResponse } from "next"

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    const { user, project, table } = req.body

    // create table in PM
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        METHOD.createTableInProject,
        { userId: user.id, projectId: project.projectId, tableName: table.tableName },
        user.authCookie
    )

    // create table in join-tables
    await coreRequest(CHANNEL.JOIN_TABLES
    "createJt",
        { tableId: table.tableId, },
    user.authCookie
    )

    res.status(200).send({})
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            throw new RangeError("GET method is handled by swr!")
        case "POST":
            POST(req, res)
            break
        case "PUT":
        case "DELETE":
            break
        default:
            throw new RangeError(`Unknown HTTP method: ${req.method}`)
    }
}
