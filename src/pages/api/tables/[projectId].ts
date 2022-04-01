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
import { AUTH_COOKIE_KEY } from "context/AuthContext"

const GET = async (
    req: NextApiRequest,
    res: NextApiResponse,
    projectId: ProjectDescriptor["id"]
) => {
    try {
        const baseTables = await coreRequest<TableDescriptor[]>(
            getTablesFromProject(projectId),
            req.cookies[AUTH_COOKIE_KEY]
        )

        const tables = await Promise.all(
            baseTables.map(t =>
                coreRequest<JtDescriptor[]>(
                    listJts(t.id),
                    req.cookies[AUTH_COOKIE_KEY]
                )
            )
        ).then(tableLists => tableLists.flat())

        res.status(200).json(tables)
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
