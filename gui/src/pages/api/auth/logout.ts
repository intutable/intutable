import { withSessionRoute } from "auth/withSessionRoute"
import { NextApiRequest, NextApiResponse } from "next"
import type { User } from "types/User"
import { DefaultRole } from "@backend/permissions/types"

const logoutRoute = async (req: NextApiRequest, res: NextApiResponse<User>) => {
    const response = await fetch(
        process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL! + "/logout",
        {
            method: "POST",
            credentials: "include",
        }
    )

    if ([200, 302, 303].includes(response.status) === false)
        throw new Error(`Ausloggen fehlgeschlagen: ${response.status}`)

    req.session.destroy()
    res.json({
        isLoggedIn: false,
        username: "",
        id: -1,
        authCookie: "",
        role: DefaultRole.Guest,
    })
}

export default withSessionRoute(logoutRoute)
