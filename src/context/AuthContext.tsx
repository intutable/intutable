import React, { useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/router"

import {
    coreLogin,
    coreLogout,
    isAuthenticated,
} from "@app/api/coreinterface/login"

export const USER_COOKIE_KEY = "dekanat.mathinf.user"

// TODO: add authcookie to user

export type User = {
    name: string
}

export type AuthContextProps = {
    user: User | null
    getUserAuthCookie?: () => string | null
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
            const currentUser = Cookies.get(USER_COOKIE_KEY)
            if (currentUser && (await isAuthenticated()))
                setUser({ name: currentUser })
            else logout()
            setLoading(false)
        })()
    }, [])

    /*
       As of now, there are 3 stateful components to being logged in: The core
       authentication (managed via a passport js cookie), the currentUser
       cookie (front-end remembering who was logged in), and the `user` hook
       (for keeping graphical elements up to date)
     */
    const login = async (username: string, password: string) => {
        setLoading(true)
        await coreLogout()
        return coreLogin(username, password)
            .then(() => {
                Cookies.set(USER_COOKIE_KEY, username, { sameSite: "Strict" })
                setUser({ name: username })
            })
            .catch(e => {
                return Promise.reject(e)
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
            .catch(e => console.log("logout failed: " + e))
            .finally(() => setLoading(false))
    }

    /**
     * Returns the current user auth cookie, or null if not logged in.
     * @returns {string} user auth cookie.
     */
    const getUserAuthCookie = (): string | null =>
        Cookies.get(USER_COOKIE_KEY) ?? null

    return (
        <AuthContext.Provider
            value={{
                user,
                getUserAuthCookie,
                loading,
                login,
                logout,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    )
}
