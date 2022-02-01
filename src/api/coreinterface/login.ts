const getCoreUrl = (): string => process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL!
import { coreRequest } from "./json"
import { CurrentUser, AUTH_COOKIE_KEY } from "@context/AuthContext"

/**
 * Log in to core via a HTTP form request.
 * @return {Promise<void>} if login was successful. Rejects with an error
 * (in string form) otherwise.
 */
export async function coreLogin(
    username: string,
    password: string
): Promise<void> {
    return fetch(getCoreUrl() + "/login", {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: `username=${username}&password=${password}`,
    })
        .catch(e => {
            console.log(e)
            return Promise.reject(
                "Interner Fehler. Kontaktieren Sie bitte den" + " Support."
            )
        })
        .then(loginSucceeded)
}

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
export async function getCurrentUser(
    authCookie?: string
): Promise<CurrentUser | null> {
    return coreRequest("user-authentication", "getCurrentUser", {}, authCookie)
        .then(async ({ username, id }) =>
            Promise.resolve({
                username: <string>username,
                id: <number>id,
                authCookie,
            })
        )
        .catch(err =>
            [301, 302].includes(err.status)
                ? Promise.resolve(null)
                : Promise.reject(err)
        )
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
