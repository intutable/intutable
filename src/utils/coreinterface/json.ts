import { getCoreUrl } from "@app/backend/runtimeconfig"
import { AUTH_COOKIE_KEY } from "./constants"

export interface CoreCallError {
    status: number
    message: string
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
 */
export async function coreRequest(
    channel: string,
    method: string,
    body: Record<string, unknown>,
    authCookie?: string
): Promise<Record<string, unknown>> {
    return fetch(getCoreUrl() + "/request/" + channel + "/" + method, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(!!authCookie && {
                Cookie: AUTH_COOKIE_KEY + "=" + authCookie,
            }),
        },
        credentials: "include",
        redirect: "manual",
        body: JSON.stringify(body),
    })
        .then(passedLogin)
        .then(wasSuccessful)
        .then(res => res.json())
}

export async function coreNotification(
    channel,
    method: string,
    body: object,
    authCookie?: string
): Promise<void> {
    return fetch(getCoreUrl() + "/notification/" + channel + "/" + method, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(!!authCookie && {
                Cookie: AUTH_COOKIE_KEY + "=" + authCookie,
            }),
        },
        credentials: "include",
        redirect: "manual",
        body: JSON.stringify(body),
    })
        .then(passedLogin)
        .then(wasSuccessful)
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

async function wasSuccessful(res: Response): Promise<Response> {
    return res.status === 200
        ? res
        : Promise.reject({
              status: res.status,
              message: await res.text(),
          })
}
