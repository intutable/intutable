import { getCurrentUser } from "auth"
import { withSessionRoute } from "auth/withSessionRoute"
import { NextApiRequest, NextApiResponse } from "next"
import { User } from "types/User"

const userRoute = async (req: NextApiRequest, res: NextApiResponse<User>) => {
    try {
        if (req.session.user == null) throw null
        const user = await getCurrentUser(req.session.user.authCookie)
        if (user == null) throw null

        res.json({
            ...req.session.user,
            isLoggedIn: true,
        })
    } catch (_) {
        res.json({
            isLoggedIn: false,
            username: "",
            authCookie: "",
            id: -1,
        })
    }
}

export default withSessionRoute(userRoute)
