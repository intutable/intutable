import { User } from "auth"
import type { Fetcher } from "swr"
import { passedLogin, checkError } from "./utils/coreRequest"
import Obj from "types/Obj"
const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!

/**
 * Fetcher function for use with useSWR hook
 */
export const fetcher: Fetcher = (...args: Parameters<typeof fetch>) =>
    fetch(...args).then(res => res.json())

/**
 * Fetcher function (with user) for use with useSWR hook
 */
export const fetchWithUser = <T = void>(
    url: string,
    user: User,
    body?: Obj,
    method: "GET" | "POST" | "PATCH" | "DELETE" = "POST"
): Promise<T> =>
    fetch(process.env.NEXT_PUBLIC_API_URL! + url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Cookie: `${AUTH_COOKIE_KEY}=${user.authCookie}`,
        },
        credentials: "include",
        redirect: "manual",
        body: body ? JSON.stringify(body) : undefined,
    })
        .then(passedLogin)
        .then(checkError)
        .then(res => res.json())
