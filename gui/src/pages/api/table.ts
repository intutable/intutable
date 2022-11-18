import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withReadWriteConnection } from "api/utils/databaseConnection"
import { withSessionRoute } from "auth"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { TableDescriptor } from "@backend/types/index" // yes, really.
import { createTable } from "@backend/requests"

/**
 * Create a new table with the specified name.
 * The table will initially contain a column "Name" which can be
 * renamed, but not deleted. We call this column "user primary", and it
 * functions as the table's key for all directly user-relevant purposes, e.g.
 * in making previews of rows for link columns. It has nothing to do with
 * the actual, SQL primary key in the database.
 * @tutorial
 * ```
 * - Body: {
 *    projectId: {@type {number}}
 *    name: {@type {string}}
 * }
 * ```
 */
const POST = withCatchingAPIRoute(async (req, res) => {
    const { projectId, name } = req.body as {
        projectId: ProjectDescriptor["id"]
        name: string
    }
    const user = req.session.user!

    const tableView = await withReadWriteConnection(user, async sessionID =>
        coreRequest<TableDescriptor>(createTable(sessionID, user.id, projectId, name), user.authCookie)
    )

    res.status(200).json(tableView)
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
