import { User } from "types/User"
import type { Fetcher } from "swr"
import Obj from "types/Obj"
import { passedLogin } from "./utils/coreRequest"

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
export const fetcher = <T>(args: FetcherOptions): Promise<T> =>
    fetch(process.env.NEXT_PUBLIC_API_URL! + args.url, {
        method: args.method || "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        credentials: "include",
        redirect: "manual",
        body: args.body
            ? typeof args.body === "string"
                ? args.body
                : JSON.stringify(args.body)
            : undefined,
    })
        .then(passedLogin)
        .then(catchException)
        .then(r => r.json())

/**
 * Catches Exceptions (http status codes in range of 4xx to 5xx)
 * and throws them to allow the handlers to catch them in a catch-block
 */
const catchException = async (res: Response): Promise<Response> => {
    if (res.status >= 400 && res.status < 600) {
        console.error(res)
        console.error(`Fetcher Received Exception (${res.status}): ${res}`)
        const body = await res.text()
        try {
            return Promise.reject(JSON.parse(body))
        } catch (e) {
            return Promise.reject(body)
        }
    }

    return Promise.resolve(res)
}
