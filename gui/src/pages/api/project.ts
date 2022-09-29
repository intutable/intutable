import {
    createProject,
    getProjects,
} from "@intutable/project-management/dist/requests"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"

/**
 * Create a project in PM with the specified user as owner.
 * @tutorial
 * ```
 * - Body: {
 *    name: {@type {string}}
 * }
 * ```
 */
const POST = withCatchingAPIRoute(async (req, res) => {
    const { name } = req.body as {
        name: ProjectDescriptor["name"]
    }
    const user = req.session.user!

    // check validity: alphanum + underscore
    if (!name.match(new RegExp(/^[\p{L}\p{N}_]*$/u))) throw Error("invalidName")

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
})

export default withSessionRoute(
    withUserCheck(async (req, res) => {
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