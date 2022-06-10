import { getProjects } from "@intutable/project-management/dist/requests"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import { Column } from "types"

/**
 * Generate a Mail-List
 * @tutorial
 * ```
 * URL: `/util/generate/mail-list`
 * ```
 */
const GET = withCatchingAPIRoute(
    async (req, res, columnId: Exclude<Column["_id"], undefined>) => {
        const user = req.session.user!
        const { filters } = req.body as {
            format: "csv" | "json"
        }

        const tableData = await coreRequest<ViewData>(
            getViewData(viewId),
            user.authCookie
        )

        res.status(200).json({})
    }
)

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        const { query, method } = req
        const columnId = parseInt(query.columnId as string)

        switch (req.method) {
            case "GET":
                await GET(req, res, columnId)
                break
            default:
                res.setHeader("Allow", ["GET"])
                res.status(405).end(`Method ${req.method} Not Allowed`)
        }
    })
)
