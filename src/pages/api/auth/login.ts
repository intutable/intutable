import type { User } from "types/User"
import { Octokit } from "octokit"
import { withIronSessionApiRoute } from "iron-session/next"
import { sessionOptions } from "auth/session"
import { NextApiRequest, NextApiResponse } from "next"

const octokit = new Octokit()

export default withIronSessionApiRoute(loginRoute, sessionOptions)

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
    const { username } = await req.body

    try {
        const {
            data: { login },
        } = await octokit.rest.users.getByUsername({ username })

        const user = { isLoggedIn: true, login } as User
        req.session.user = user
        await req.session.save()
        res.json(user)
    } catch (error) {
        res.status(500).json({ message: (error as Error).message })
    }
}
