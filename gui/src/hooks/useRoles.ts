import useSWR, { unstable_serialize } from "swr"
import { Role } from "@backend/permissions"

/**
 * ### useRoles hook.
 *
 * Returns a list of projects.
 */
export const useRoles = () => {
    const {
        data: roles,
        error,
        mutate,
    } = useSWR<Role[]>({ url: `/api/permissions/roles`, method: "GET" })

    return { roles, error, mutate }
}

/**
 * Config for `useRoles` hook.
 */
export const useRolesConfig = {
    /**
     * Returns the swr cache key for `useRolesConfig`.
     * Can be used to ssr data.
     *
     * Note: the key does **not** neet to be serialized.
     */
    cacheKey: unstable_serialize({
        url: `/api/permissions/roles`,
        method: "GET"
    }),
}
