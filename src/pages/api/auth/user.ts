import { withSessionRoute } from "auth/withSessionRoute"
import { NextApiRequest, NextApiResponse } from "next"
import { User } from "types/User"

const userRoute = async (req: NextApiRequest, res: NextApiResponse<User>) => {
    if (req.session.user) {
        res.json({
            ...req.session.user,
            isLoggedIn: true,
        })
    } else {
        res.json({
            isLoggedIn: false,
            username: "",
            id: -1,
        })
    }
}

export default withSessionRoute(userRoute)
