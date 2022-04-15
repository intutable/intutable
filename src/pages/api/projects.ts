import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { getProjects } from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"
import { withSessionRoute } from "auth"
import { checkUser } from "utils/checkUser"

/**
 * List projects that belong to a user.
 * @tutorial
 * ```
 * URL: `/api/projects`
 * ```
 */
const GET = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const user = checkUser(req.session.user)
        const projects = await coreRequest<ProjectDescriptor[]>(
            getProjects(user.id),
            user.authCookie
        )

        res.status(200).json(projects)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}

export default withSessionRoute(
    async (req: NextApiRequest, res: NextApiResponse) => {
        switch (req.method) {
            case "GET":
                await GET(req, res)
                break
            default:
                res.setHeader("Allow", ["GET"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    }
)
