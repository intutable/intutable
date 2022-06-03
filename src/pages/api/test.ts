import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import type { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/error-handling/utils/makeError"

const POST = withCatchingAPIRoute(
    async (req: NextApiRequest, res: NextApiResponse) => {
        console.log(2, "hellloooooo")
        throw new Error("bad")
        res.status(200).json("hello")
    }
)

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "POST":
            await POST(req, res)
            break
        default:
            res.setHeader("Allow", ["POST"])
            res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
