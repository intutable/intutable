import { AuthenticationError } from "api/utils/AuthenticationError"
import Obj from "types/Obj"
import { isErrorLike } from "utils/error-handling/ErrorLike"
import { isErrorObject } from "utils/error-handling/utils/ErrorObject"
/**
 * Fetcher function for use with useSWR hookb
 */
// export const fetcher: Fetcher = (...args: Parameters<typeof fetch>) =>
//     fetch(...args).then(res => res.json())

type FetcherOptions = {
    url: string
    /**
     * Either already JSON or a plain object
     */
    body?: Obj | string
    /**
     * @default POST
     */
    method?: "GET" | "POST" | "PATCH" | "DELETE"
    headers?: HeadersInit
}

/**
 * Fetcher for use with `swr`.
 * Implements the native `fetcher` method and sets default values.
 *
 * Note: Forwarding the user is only temporarily and will be deprecated in a fute version.
 *
 * In case an exception is returned (301, 302 and 4xx to 5xx), the response is thrown.
 * This is allows catching the response in a catch-block rather than checking manually the status code.+
 *
 * Otherwise the deserialized json is returned.
 */
export const fetcher = async <T>(args: FetcherOptions): Promise<T> => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL! + args.url, {
        method: args.method || "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...args.headers,
        },
        credentials: "include",
        redirect: "manual",
        body: args.body
            ? typeof args.body === "string"
                ? args.body
                : JSON.stringify(args.body)
            : undefined,
    })

    const body = await res.json()

    await catchAuthError(res, body)
    await catchException(res, body)

    return body
}
/**
 * Catches Exceptions (http status codes in range of 4xx to 5xx)
 * and throws them to allow the handlers to catch them in a catch-block
 */
export const catchException = async (
    res: Response,
    body: unknown
): Promise<Response> => {
    if (res.status >= 400 && res.status < 600) {
        if (isErrorObject(body) || isErrorLike(body)) throw body
        throw res
    }
    return res
}

/**
 * Catches Authentication Errors (http status code 302 or type === "opaqueredirect")
 */
export const catchAuthError = async (
    res: Response,
    body: unknown
): Promise<Response> => {
    if (
        res.type === "opaqueredirect" ||
        [301, 302].includes(res.status) ||
        (isErrorLike(body) && body.name === "AuthenticationError")
    )
        throw new AuthenticationError(
            "core call blocked by authentication middleware",
            302,
            res
        )

    return res
}
