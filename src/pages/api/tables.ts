import { listJts } from "@intutable/join-tables/dist/requests"
import { CHANNEL } from "api/constants"
import { coreRequest } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { PMTypes as PM } from "types"
import { makeError } from "utils/makeError"

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, project } = req.body as {
            user: User
            project: PM.Project
        }

        const tables = await coreRequest(
            CHANNEL.JOIN_TABLES,
            listJts.name,
            listJts(project.id),
            user.authCookie
        )

        res.status(200).json(tables)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            GET(req, res)
            break
        default:
            res.status(req.method === "HEAD" ? 500 : 501).send(
                "This method is not supported!"
            )
    }
}
