import { createProject } from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { User } from "auth"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import type { NextApiRequest, NextApiResponse } from "next"
import { PMTypes as PM } from "types"
import { makeError } from "utils/makeError"

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, name } = req.body as {
            user: User
            name: PM.Project.Name
        }

        // create project in project-management
        const project = await coreRequest<PM.Project>(
            createProject(user.id, name),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).json(project)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { method } = req

    switch (method) {
        case "POST":
            await POST(req, res)
            break
        default:
            res.setHeader("Allow", ["POST"])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
