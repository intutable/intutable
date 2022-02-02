import Obj from "@utils/Obj"
const CORE_ENDPOINT = process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL!
const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!

export type CoreCallError = {
    status: number
    message: string | Error
}

export class CoreRequestError extends Error {
    public readonly statusCode: number

    constructor(message: string, statusCode: number) {
        super(message)
        this.name = this.constructor.name
        // this.stack = new Error().stack
        this.statusCode = statusCode
    }
}

export class NetworkError extends Error {
    constructor(message: string, statusCode: number) {
        super(message)
        this.name = this.constructor.name
    }
}

/**
 * Makes a request to Core and returns the response parsed from JSON as an object.
 * Built up on `fetch`.
 * @async
 * @param {string} channel - The channel to make the request to.
 * @param {string} method - The method to call on the channel.
 * @param {object} body - The body of the request.
 * @param {string} authCookie - The auth cookie to send with the request. Optional.
 * @returns {Promise<object>} - The response parsed from JSON as an object.
 * @throws {CoreRequestError}
 */
export const coreRequest = (
    channel: string,
    method: string,
    body: Obj,
    authCookie?: string
): Promise<unknown> =>
    fetch(CORE_ENDPOINT + "/request/" + channel + "/" + method, {
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
        body: JSON.stringify(body),
    })
        .then(passedLogin)
        .then(checkError)
        .then(res => res.json())
// .catch(error => {
//     // Fetch API only throws on network errors
//     // TODO: handle network error
//     if (error) {
//         console.error(error)
//         throw new error()
//     }
// })

export async function coreNotification(
    channel: string,
    method: string,
    body: Obj,
    authCookie?: string
): Promise<void> {
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
        body: JSON.stringify(body),
    })
        .then(passedLogin)
        .then(checkError)
        .then(() => Promise.resolve())
}

// TEMP
// Set of error checking functions that are intended to operate by
// fall-through principle
function passedLogin(res: Response): Promise<Response> {
    return res.type === "opaqueredirect" || [301, 302].includes(res.status)
        ? Promise.reject({
              status: 302,
              message: "core call blocked by authentication middleware",
          })
        : Promise.resolve(res)
}

const checkError = async (res: Response): Promise<Response> => {
    if (res.ok) return res
    return Promise.reject(new CoreRequestError(await res.text(), res.status))
}
