import { coreRequest } from "../../api/utils/coreRequest"
import { User } from "auth"

/**
 * Check if logged into core by using the session cookie.
 */
export const getCurrentUser = async (
    authCookie?: string
): Promise<User | null> => {
    try {
        const user = (await coreRequest(
            {
                channel: "user-authentication",
                method: getCurrentUser.name,
            },
            authCookie
        )) as Omit<User, "authCookie">

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
