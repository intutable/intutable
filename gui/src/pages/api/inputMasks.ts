import { getAll as getAllInputMasks } from "@shared/input-masks/database"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"

/**
 * Get all input masks
 */
const GET = withCatchingAPIRoute(async (req, res) => {
    // const user = req.session.user!
    // const roleId = parseInt(process.env.PROJECT_MANAGEMENT_ROLE!)

    // TODO: create a core request that returns all input masks
    const inputMasks = getAllInputMasks()

    res.status(200).json(inputMasks)
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
