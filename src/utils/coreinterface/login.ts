import { getCoreUrl } from "@app/backend/runtimeconfig"
import { coreRequest } from "./json"

export { AUTH_COOKIE_KEY } from "./constants"

/**
 * Log in to core via a HTTP form request.
 * @return {Promise<void>} if login was successful. Rejects with an error
 * (in string form) otherwise.
 */
export async function coreLogin(username, password: string): Promise<void> {
    return fetch(getCoreUrl() + "/login", {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: `username=${username}&password=${password}`,
    }).catch(e => {
        console.log(e)
        return Promise.reject("Interner Fehler. Kontaktieren Sie bitte den" +
            " Support.")
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
export async function isAuthenticated(authCookie?: string): Promise<bool> {
    // we could have called any channel or method
    return coreRequest("user-authentication", "hashPassword",
                       { password: "12345678" }, authCookie)
        .then(() => Promise.resolve(true))
        .catch(err => [301, 302].includes(err.status)
            ? Promise.resolve(false)
            : Promise.reject(err))
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
