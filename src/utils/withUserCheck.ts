import { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { User } from "types/User"
import { makeError } from "./error/makeError"

/**
 * Checks if the user is logged in, otherwise throws
 * @param {User | undefined} user
 * @returns {User}
 */
export const checkUser = (user: User | undefined): User => {
    if (user && user.isLoggedIn) return user
    throw new Error("Could not get the user from session!")
}

/**
 * API Route Middleware that checks if the user is logged in in session,
 * otherwise
 * @param {NextApiHandler} handler next handler once the middleware finished
 * @returns {NextApiHandler}
 */
export const withUserCheck =
    (handler: NextApiHandler): NextApiHandler =>
    (req: NextApiRequest, res: NextApiResponse) => {
        try {
            checkUser(req.session.user)

            return handler(req, res)
        } catch (e) {
            const error = makeError(e)
            res.status(401).json({ error: error.message })
        }
    }
