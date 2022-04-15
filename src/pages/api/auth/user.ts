import { withSessionRoute } from "auth/withSessionRoute"
import { NextApiRequest, NextApiResponse } from "next"
import { User } from "types/User"

const userRoute = async (req: NextApiRequest, res: NextApiResponse<User>) => {
    // TODO: check if the user is still connect by asking the backend
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
