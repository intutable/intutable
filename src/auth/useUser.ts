import { useEffect } from "react"
import Router from "next/router"
import useSWR from "swr"
import type { User } from "types/User"

type UseUserOptions = {
    /**
     * if successfully logged in, the user will be
     * redirected to this url
     * @default "" (empty string)
     */
    redirectTo?: string
    /**
     *
     */
    redirectIfFound?: boolean
}

const UseUserDefaultOptions: UseUserOptions = {
    redirectTo: "",
    redirectIfFound: false,
}

export const useUser = (options: UseUserOptions = UseUserDefaultOptions) => {
    const { redirectTo, redirectIfFound } = options

    const { data: user, mutate: mutateUser } = useSWR<User>("/api/user")

    useEffect(() => {
        // if no redirect needed, just return (example: already on /dashboard)
        // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
        if (!redirectTo || !user) return

        if (
            // If redirectTo is set, redirect if the user was not found.
            (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
            // If redirectIfFound is also set, redirect if the user was found
            (redirectIfFound && user?.isLoggedIn)
        ) {
            Router.push(redirectTo)
        }
    }, [user, redirectIfFound, redirectTo])

    return { user, mutateUser }
}
