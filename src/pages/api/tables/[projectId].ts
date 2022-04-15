import {
    ProjectDescriptor,
    TableDescriptor,
} from "@intutable/project-management/dist/types"
import { getTablesFromProject } from "@intutable/project-management/dist/requests"
import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { listJts } from "@intutable/join-tables/dist/requests"
import { coreRequest } from "api/utils"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"
import { withSessionRoute } from "auth"
import { checkUser } from "utils/checkUser"

/**
 * List tables that belong to a project. Note that these are join tables from
 * the corresponding plugin.
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
        const user = checkUser(req.session.user)
        const baseTables = await coreRequest<TableDescriptor[]>(
            getTablesFromProject(projectId),
            user.authCookie
        )

        const tables = await Promise.all(
            baseTables.map(t =>
                coreRequest<JtDescriptor[]>(listJts(t.id), user.authCookie)
            )
        ).then(tableLists => tableLists.flat())

        res.status(200).json(tables)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}
export default withSessionRoute(
    async (req: NextApiRequest, res: NextApiResponse) => {
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
    }
)
