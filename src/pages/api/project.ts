import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import {
    getProjects,
    createProject,
} from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { User } from "auth"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"

/**
 * Create a project in PM with the specified user as owner.
 * @tutorial
 * ```
 * - Body: {
 *    user: {@type {User}}
 *    name: {@type {string}}
 * }
 * ```
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { user, name } = req.body as {
            user: User
            name: ProjectDescriptor["name"]
        }

        // check validity: alphanum + underscore
        if (!name.match(new RegExp(/^[\p{L}\p{N}_]*$/u)))
            throw Error("invalidName")

        // check if already exists
        const projects = await coreRequest<ProjectDescriptor[]>(
            getProjects(user.id),
            req.cookies[AUTH_COOKIE_KEY]
        )
        if (projects.some(p => p.name === name)) {
            throw Error("alreadyTaken")
        }

        // create project in project-management
        const project = await coreRequest<ProjectDescriptor>(
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
