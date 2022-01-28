import React, { useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/router"

import {
    coreLogin,
    coreLogout,
    getCurrentUser
} from "@app/api/coreinterface/login"

export const USER_COOKIE_KEY = process.env.NEXT_PUBLIC_USER_COOKIE_KEY!
export const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!

/**
 * Authentication data of the current user.
 * @property {string} username
 * @property {string | null} authCookie the back-end authentication
 * cookie. In front-end use, this is null, as the cookie is HttpOnly
 * and passed along automatically. Still necessary for SSR.
 */
export type CurrentUser = {
    username: string
    id: number
    authCookie: string | null
}

export type AuthContextProps = {
    user: CurrentUser | null
    loading: boolean
    login?: (username: string, password: string) => Promise<void>
    logout?: () => Promise<void>
}

const initialState: AuthContextProps = {
    user: null,
    loading: true,
}

const AuthContext = React.createContext<AuthContextProps>(initialState)

export const useAuth = () => React.useContext(AuthContext)

export const AuthProvider: React.FC = props => {
    const router = useRouter()

    const [loading, setLoading] = useState<
        Pick<AuthContextProps, "loading">["loading"]
    >(initialState.loading)

    const [user, setUser] = useState<Pick<AuthContextProps, "user">["user"]>(
        initialState.user
    )

    useEffect(() => {
        // check if a user is already logged in
        ;(async _ => {
            const currentUserName = Cookies.get(USER_COOKIE_KEY)
            if (currentUserName)
                setUser(await getCurrentUser(currentUserName, null))
            setLoading(false)
        })()
    }, [])

    /*
       As of now, there are 3 stateful components to being logged in: The core
       authentication (managed via a passport js cookie), the currentUser
       cookie (front-end remembering who was logged in), and the `user` hook
       (for keeping graphical elements up to date). authCookie only needs
       to be set in SSR requests, 
     */
    const login = async (username: string, password: string) => {
        setLoading(true)
        await coreLogout()
        return coreLogin(username, password)
            .then(() => {
                const userCookie = Cookies.set(USER_COOKIE_KEY, username, {
                    sameSite: "Strict",
                })
                if (!userCookie)
                    throw new Error("Could not set the User Cookie!")
                setUser({ username: username, authCookie: null })
            })
            .finally(() => setLoading(false))
    }

    const logout = async () => {
        setLoading(true)
        return coreLogout()
            .then(() => {
                Cookies.remove(USER_COOKIE_KEY)
                setUser(null)
                router.push("/login")
            })
            .finally(() => setLoading(false))
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    )
}
