import { withIronSessionApiRoute } from "iron-session/next"
import { sessionOptions } from "auth/session"
import { NextApiRequest, NextApiResponse } from "next"
import type { User } from "types/User"

export default withIronSessionApiRoute(logoutRoute, sessionOptions)

function logoutRoute(req: NextApiRequest, res: NextApiResponse<User>) {
    req.session.destroy()
    res.json({ isLoggedIn: false, login: "", username: "", id: -1 })
}
