const getCoreUrl = (): string => process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL!
import { coreRequest } from "./coreRequest"
import { CurrentUser, AUTH_COOKIE_KEY } from "@context/AuthContext"
import { CHANNEL } from "."

/**
 * Log in to core via a HTTP form request.
 * @return {Promise<void>} if login was successful. Rejects with an error
 * (in string form) otherwise.
 */
export const coreLogin = async (
    username: string,
    password: string
): Promise<void> =>
    fetch(getCoreUrl() + "/login", {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: `username=${username}&password=${password}`,
    }).then(loginSucceeded)

/**
 * Log out of core via HTTP request.
 * @return {Promise<void>} Empty resolve. Rejects with the response's status
 * code if it isn't a success-y status.
 */
export async function coreLogout(): Promise<void> {
    return fetch(getCoreUrl() + "/logout", {
        method: "post",
        credentials: "include",
    }).then(res =>
        ![200, 302, 303].includes(res.status)
            ? Promise.reject(res.status)
            : Promise.resolve()
    )
}

/**
 * Check if logged into core by using the session cookie.
 */
export const getCurrentUser = async (
    authCookie?: string
): Promise<CurrentUser | null> => {
    try {
        const user = (await coreRequest(
            CHANNEL.USER_AUTHENTICATION,
            getCurrentUser.name,
            {},
            authCookie
        )) as Omit<CurrentUser, "authCookie">

        return Promise.resolve({
            ...user,
            authCookie,
        })
    } catch (err) {
        if (typeof err === "object" && err != null && "status" in err) {
            const { status } = err as { status: number }
            return [301, 302].includes(status)
                ? Promise.resolve(null)
                : Promise.reject(err as unknown)
        }
        return Promise.reject(new Error("Internal Error"))
    }
}

// TEMP
// plugin currently uses static redirects so this is how we have to deal with
// this.
async function loginSucceeded(res: Response): Promise<void> {
    if (res.status !== 200)
        return Promise.reject(
            "Netzwerkfehler, Status = " + res.status.toString()
        )
    else
        return res
            .text()
            .then(contents =>
                contents.includes("secret")
                    ? Promise.resolve()
                    : Promise.reject(
                          "Kombination von Nutzername und Passwort" +
                              " nicht gefunden"
                      )
            )
}
