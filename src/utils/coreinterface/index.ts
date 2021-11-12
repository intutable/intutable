import { getCoreUrl } from "@app/backend/runtimeconfig"

/**
 * Log in to core via a HTTP form request.
 * @return {Promise<string>} the username given, if the login was successful.
 * Rejects with a string error message otherwise.
 */
export async function coreLogin(username, password: string) : Promise<string> {
    return fetch(getCoreUrl() + "/login", {
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: `username=${username}&password=${password}`
    })
        .then(loginSucceeded)
        .then(() => username)
}

/**
 * Log out of core via HTTP request.
 * @return {Promise<void>} Empty resolve. Rejects with the response's status
 * code if it isn't a success-y status.
 */
export async function coreLogout() {
    return fetch(getCoreUrl() + "/logout", {
        method: "post",
        credentials: "include" })
        .then((res) => (! [200, 302, 303].includes(res.status))
            ? Promise.reject(res.status)
            : Promise.resolve())
}


// plugin currently uses static redirects so this is how we have to deal with
// this.
async function loginSucceeded(res : Response) {
    if (res.status !== 200)
        return Promise.reject("Netzwerkfehler, Status = "
            + res.status.toString())
    else
        return res.text()
            .then(contents => contents.includes("secret")
                ? Promise.resolve()
                : Promise.reject("Kombination von Nutzername und Passwort"
                    + " nicht gefunden"))
}
