import { ViewDescriptor, listViews, tableId } from "@intutable/lazy-views"
import { getTablesFromProject } from "@intutable/project-management/dist/requests"
import {
    ProjectDescriptor,
    TableDescriptor,
} from "@intutable/project-management/dist/types"
import { coreRequest } from "api/utils"
import { withSessionRoute } from "auth"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"
import { withUserCheck } from "utils/withUserCheck"

/**
 * List tables that belong to a project. These are actually views from teh
 * `lazy-views` plugin.
 * @tutorial
 * ```
 * URL: `/api/tables/[projectId]`
 * ```
 */
const GET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: ProjectDescriptor["id"]
) => {
    try {
        const user = req.session.user!
        const baseTables = await coreRequest<TableDescriptor[]>(
            getTablesFromProject(projectId),
            user.authCookie
        )

        const tables = await Promise.all(
            baseTables.map(t =>
                coreRequest<ViewDescriptor[]>(
                    listViews(tableId(t.id)),
                    user.authCookie
                )
            )
        ).then(tableLists => tableLists.flat())

        res.status(200).json(tables)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}
export default withSessionRoute(
    withUserCheck(async (req: NextApiRequest, res: NextApiResponse) => {
        const { query, method } = req
        const projectId = parseInt(query.projectId as string)

        switch (method) {
            case "GET":
                await GET(req, res, projectId)
                break
            default:
                res.setHeader("Allow", ["GET"])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    })
)
