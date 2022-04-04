import { withSessionRoute } from "auth/withSessionRoute"
import { NextApiRequest, NextApiResponse } from "next"
import type { User } from "types/User"

const logoutRoute = async (req: NextApiRequest, res: NextApiResponse<User>) => {
    const response = await fetch(
        process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL! + "/logout",
        {
            method: "post",
            credentials: "include",
        }
    )

    if ([200, 302, 303].includes(response.status) === false)
        throw new Error(`Ausloggen fehlgeschlagen: ${response.status}`)

    req.session.destroy()
    res.json({ isLoggedIn: false, username: "", id: -1 })
}

export default withSessionRoute(logoutRoute)
