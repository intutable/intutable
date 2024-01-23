import { getProjects } from "../../../../../libs/dekanat-app-plugin/dist/requests"
import { ProjectDescriptor } from "@intutable-org/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withReadOnlyConnection } from "api/utils/databaseConnection"
import { withSessionRoute } from "auth"

/**
 * List projects that belong to a user.
 * @tutorial
 * ```
 * URL: `/api/projects`
 * ```
 */
const GET = withCatchingAPIRoute(async (req, res) => {
    const user = req.session.user!

    // TODO roleId in plugin, hardcode
    const roleId = parseInt(process.env.PROJECT_MANAGEMENT_ROLE!)

    const projects = await withReadOnlyConnection(user, async sessionID => {
        return coreRequest<ProjectDescriptor[]>(
            getProjects(sessionID, roleId, user.username),
            user.authCookie
        )
    })

    res.status(200).json(projects)
})

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        switch (req.method) {
            case "GET":
                await GET(req, res)
                break
            default:
                res.setHeader("Allow", ["GET"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)