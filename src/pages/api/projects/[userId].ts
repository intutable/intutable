import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { getProjects } from "@intutable/project-management/dist/requests"
import { coreRequest } from "api/utils"
import { AUTH_COOKIE_KEY } from "context/AuthContext"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/makeError"

const GET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    userId: number
) => {
    try {
        const projects = await coreRequest<ProjectDescriptor[]>(
            getProjects(userId),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).json(projects)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { query, method } = req
    const userId = parseInt(query.userId as string)

    switch (method) {
        case "GET":
            await GET(req, res, userId)
            break
        default:
            res.setHeader("Allow", ["GET"])
            res.status(405).end(`Method ${method} Not Allowed`)
    }
}
