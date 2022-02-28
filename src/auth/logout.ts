/**
 * Log out of core via HTTP request.
 * @return {Promise<void>} Empty resolve. Rejects with the response's status
 * code if it isn't a success-y status.
 */
export const logout = async (): Promise<void> => {
    const response = await fetch(
        process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL! + "/logout",
        {
            method: "post",
            credentials: "include",
        }
    )

    if ([200, 302, 303].includes(response.status) === false)
        throw new Error(`Ausloggen fehlgeschlagen: ${response.status}`)
}
