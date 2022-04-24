import {
    createProject,
    getProjects,
} from "@intutable/project-management/dist/requests"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"
import { withUserCheck } from "utils/withUserCheck"

/**
 * Create a project in PM with the specified user as owner.
 * @tutorial
 * ```
 * - Body: {
 *    name: {@type {string}}
 * }
 * ```
 */
const POST = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { name } = req.body as {
            name: ProjectDescriptor["name"]
        }
        const user = req.session.user!

        // check validity: alphanum + underscore
        if (!name.match(new RegExp(/^[\p{L}\p{N}_]*$/u)))
            throw Error("invalidName")

        // check if already exists
        const projects = await coreRequest<ProjectDescriptor[]>(
            getProjects(user.id),
            user.authCookie
        )
        if (projects.some(p => p.name === name)) {
            throw Error("alreadyTaken")
        }

        // create project in project-management
        const project = await coreRequest<ProjectDescriptor>(
            createProject(user.id, name),
            user.authCookie
        )

        res.status(200).json(project)
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
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
