import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { listJts } from "@intutable/join-tables/dist/requests"
import { coreRequest } from "api/utils"
import type { NextApiRequest, NextApiResponse } from "next"
import { PMTypes as PM } from "types"
import { makeError } from "utils/makeError"
import { AUTH_COOKIE_KEY } from "context/AuthContext"

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { project } = req.body as { project: PM.Project }

        const tables = await coreRequest<JtDescriptor[]>(
            listJts(project.id),
            req.cookies[AUTH_COOKIE_KEY]
        )

        res.status(200).json(tables)
    } catch (err) {
        const error = makeError(err)
        res.status(500).json({ error: error.message })
    }
}
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET":
            GET(req, res)
            break
        default:
            res.setHeader("Allow", ["GET"])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
