import { getCoreUrl } from "@app/backend/runtimeconfig"
import { AUTH_COOKIE_KEY } from "./login"

export { AUTH_COOKIE_KEY } from "./login"

export interface CoreCallError {
    status: number
    message: string
}

/**
 * Make a request to Core and return the response parsed from JSON as an object.
 */
export async function coreRequest(
    channel,
    method: string,
    body: object,
    authCookie?: string
): Promise<object> {
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
        .then(Promise.resolve())
}

// TEMP
// Set of error checking functions that are intended to operate by
// fall-through principle
function passedLogin(res: Response): Promise<Response> {
    return [301, 302].includes(res.status)
        ? Promise.reject({
              status: res.status,
              message: "core call blocked by authentication middleware",
          })
        : res
}

async function wasSuccessful(res: Response): Promse<Response> {
    return res.status === 200
        ? res
        : Promise.reject({
              status: res.status,
              message: await res.text(),
          })
}
