import { NextApiRequest } from "next"
import Obj from "types/Obj"
const CORE_ENDPOINT = process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL!
const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!

export class CoreRequestError extends Error {
    public readonly status: number

    constructor(message: string, status: number) {
        super(message)
        this.name = this.constructor.name
        // this.stack = new Error().stack
        this.status = status
    }
}

/**
 * Makes a request to Core and returns the response parsed from JSON as an
 * object. Built up on `fetch`.
 * @async
 * @param {object} request - A standard core request with channel, method,
 * and whatever arguments that method takes. Use `<plugin>/dist/requests` to
 * build these.
 * @param {string} authCookie - The auth cookie to send with the request. Optional.
 * @returns {Promise<object>} - The response parsed from JSON as an object.
 * @throws {CoreRequestError}
 */
export const coreRequest = <T = unknown>(
    request: Obj,
    authCookie?: NextApiRequest | string
): Promise<T> => {
    const channel = request.channel
    const method = request.method
    delete request.channel
    delete request.method
    const cookie =
        typeof authCookie === "string"
            ? authCookie
            : authCookie!.cookies[AUTH_COOKIE_KEY]
    return fetch(CORE_ENDPOINT + "/request/" + channel + "/" + method, {
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
        body: JSON.stringify(request),
    })
        .then(passedLogin)
        .then(checkError)
        .then(res => res.json())
}

export async function coreNotification(
    notification: Obj,
    authCookie?: string
): Promise<void> {
    const channel = notification.channel
    const method = notification.method
    delete notification.channel
    delete notification.method
    return fetch(CORE_ENDPOINT + "/notification/" + channel + "/" + method, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(authCookie && {
                Cookie: AUTH_COOKIE_KEY + "=" + authCookie,
            }),
        },
        credentials: "include",
        redirect: "manual",
        body: JSON.stringify(notification),
    })
        .then(passedLogin)
        .then(checkError)
        .then(() => Promise.resolve())
}

// Set of error checking functions that are intended to operate by
// fall-through principle
export function passedLogin(res: Response): Promise<Response> {
    return res.type === "opaqueredirect" || [301, 302].includes(res.status)
        ? Promise.reject({
              status: 302,
              message: "core call blocked by authentication middleware",
          })
        : Promise.resolve(res)
}

export async function checkError(res: Response): Promise<Response> {
    if (res.ok) return res
    return Promise.reject(new CoreRequestError(await res.text(), res.status))
}
