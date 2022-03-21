import { User } from "auth"
import type { Fetcher } from "swr"
const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!

/**
 * Fetcher function for use with useSWR hook
 */
export const fetcher: Fetcher = (...args: Parameters<typeof fetch>) =>
    fetch(...args).then(res => res.json())

/**
 * Fetcher function (with user) for use with useSWR hook
 */
export const fetchWithUser = (
    url: string,
    user: User,
    body: RequestInit["body"]
) =>
    fetch(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Cookie: `${AUTH_COOKIE_KEY}=${user.authCookie}`,
        },
        credentials: "include",
        redirect: "manual",
        body: JSON.stringify(body),
    })
        .then(passedLogin)
        .then(res => res.json())

/**
 * Set of error checking functions that are intended to operate by fall-through principle
 */
const passedLogin = (res: Response): Promise<Response> =>
    res.type === "opaqueredirect" || [301, 302].includes(res.status)
        ? Promise.reject({
              status: 302,
              message: "core call blocked by authentication middleware",
          })
        : Promise.resolve(res)
