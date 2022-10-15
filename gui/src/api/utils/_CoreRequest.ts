import { NextApiRequest } from "next"
import Obj from "types/Obj"
import { ErrorLike } from "utils/error-handling/ErrorLike"
const CORE_ENDPOINT = process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL!
const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME!

export class CoreRequestError extends Error {
    public readonly status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = this.constructor.name
        this.status = status
        Error.captureStackTrace(this)
    }
}

export type Middleware = (res: Response) => PromiseLike<Response> | Response

export type Options = {
    middleware?: Middleware[]
}

export class CoreRequest {
    constructor(private options: Options) {}

    public async request<T = unknown>(
        request: Obj,
        authCookie: NextApiRequest | string
    ): Promise<T> {
        const { channel, method, ...req } = request

        if (authCookie == null)
            throw new RangeError("AuthCookie is not defined!")

        const cookie =
            typeof authCookie === "string"
                ? authCookie
                : authCookie.cookies[AUTH_COOKIE_KEY]

        let response = await fetch(
            CORE_ENDPOINT + "/request/" + channel + "/" + method,
            {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...(cookie && {
                        Cookie: AUTH_COOKIE_KEY + "=" + cookie,
                    }),
                },
                credentials: "include",
                redirect: "manual",
                body: JSON.stringify(req),
            }
        )

        if (this.options.middleware) {
            this.options.middleware.forEach(async middleware => {
                response = await middleware(response)
            })
        }

        return await response.json()
    }
}

// Set of error checking functions that are intended to operate by
// fall-through principle
const passedLogin = async (res: Response): Promise<Response> => {
    if (res.type === "opaqueredirect" || [301, 302].includes(res.status))
        throw {
            name: "AuthenticationError",
            stack: "Next API Handler",
            message: "core call blocked by authentication middleware",
            status: 302,
        } as ErrorLike

    return res
}

const checkError = async (res: Response): Promise<Response> => {
    if (res.ok) return res
    throw new CoreRequestError(await res.text(), res.status)
}

// Factory exported
export const coreRequest = new CoreRequest({
    middleware: [passedLogin, checkError],
}).request // <-- Only exported this function, was easier to replace with existing code
