import { coreRequest } from "../../api/utils/coreRequest"
import { CurrentUser } from "@context/AuthContext"
import { CHANNEL } from "../../api/utils"

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
