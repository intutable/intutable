import { getCurrentUser } from "auth"
import { withSessionRoute } from "auth/withSessionRoute"
import { NextApiRequest, NextApiResponse } from "next"
import { User } from "types/User"

const userRoute = async (req: NextApiRequest, res: NextApiResponse<User>) => {
    if (req.session.user) {
        const user = await getCurrentUser(req.session.user.authCookie)
        if (user == null) throw new Error("The user was logged out!")

        res.json({
            ...req.session.user,
            isLoggedIn: true,
        })
    } else {
        res.json({
            isLoggedIn: false,
            username: "",
            authCookie: "",
            id: -1,
        })
    }
}

export default withSessionRoute(userRoute)
