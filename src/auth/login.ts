/**
 * Log in to core via a HTTP form request.
 * @return {Promise<void>} if login was successful. Rejects with an error otherwise.
 */
export const login = async (
    username: string,
    password: string
): Promise<void> => {
    const response = await fetch(
        process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL! + "/login",
        {
            method: "post",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            credentials: "include",
            body: `username=${username}&password=${password}`,
        }
    )

    // TODO: remove temporarily used code
    // plugin currently uses static redirects so this is how we have to deal with this

    if (response.status !== 200)
        throw new Error(`Netzwerkfehler, Status = ${response.status}`)

    const text = await response.text()

    if (text.includes("secret") === false)
        throw new Error(
            "Kombination aus Nutzername und Passwort nicht gefunden!"
        )
}
