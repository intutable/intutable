import { withIronSessionApiRoute } from "iron-session/next"
import { sessionOptions } from "auth/session"
import { NextApiRequest, NextApiResponse } from "next"
import { withSessionRoute } from "auth/withSessionRoute"

export type Events =
    Endpoints["GET /users/{username}/events"]["response"]["data"]

const octokit = new Octokit()

const eventsRoute = async (
    req: NextApiRequest,
    res: NextApiResponse<Events>
) => {
    const user = req.session.user

    if (!user || user.isLoggedIn === false) {
        res.status(401).end()
        return
    }

    try {
        const { data: events } =
            await octokit.rest.activity.listPublicEventsForUser({
                username: user.login,
            })

        res.json(events)
    } catch (error) {
        res.status(200).json([])
    }
}

export default withSessionRoute(eventsRoute)
