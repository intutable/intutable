import { getProjects } from "@intutable/project-management/dist/requests"
import { CHANNEL } from "api/constants"
import { coreRequest } from "api/utils"
import { User } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user } = req.body as {
            user: User
        }

        const projects = await coreRequest(
            CHANNEL.PROJECT_MANAGEMENT,
            getProjects.name,
            getProjects(user.id),
            user.authCookie
        )

        res.status(200).json(projects)
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
        default:
            res.status(req.method === "HEAD" ? 500 : 501).send(
                "This method is not supported!"
            )
    }
}
