import { NextApiRequest, NextApiResponse } from "next"
import { makeError } from "utils/error-handling/utils/makeError"

export type APIRouteHandler<T extends unknown[]> = (
    req: NextApiRequest,
    res: NextApiResponse,
    ...args: T
) => Promise<void>

/**
 *
 * @param handler
 */
export const withCatchingAPIRoute =
    <T extends unknown[]>(handler: APIRouteHandler<T>) =>
    async (req: NextApiRequest, res: NextApiResponse, ...args: T) => {
        try {
            await handler(req, res, ...args)
        } catch (error) {
            const err = makeError(error)
            res.status(500).json({ error: err.message })
        }
    }
