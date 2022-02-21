import { CurrentUser } from "@app/context/AuthContext"
import Obj from "@app/utils/Obj"
const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!
import type { Fetcher } from "swr"
const CORE = process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL!
import { Route, ResponseTypeOf, Routes } from "./routes"

/**
 * Fetcher function for use with useSWR hook
 */
export const fetcher: Fetcher = (...args: Parameters<typeof fetch>) =>
    fetch(...args).then(res => res.json())

/**
 * Fetcher function (with user) for use with useSWR hook
 */
export const fetchWithUser = (
    url: Route,
    user: CurrentUser,
    body: RequestInit["body"]
) =>
    fetch(CORE + url, {
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
