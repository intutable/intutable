import React, { useCallback, useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/router"
import { makeAPI } from "@api"

import {
    coreLogin,
    coreLogout,
    isAuthenticated,
} from "@app/api/coreinterface/login"

export const USER_COOKIE_KEY = "dekanat.mathinf.user"

export type User = {
    name: string
    cookie: string
}

export type AuthContextProps = {
    user: User | null
    loading: boolean
    login?: (username: string, password: string) => Promise<void>
    logout?: () => Promise<void>
    API: ReturnType<typeof makeAPI> | null
}

const initialState: AuthContextProps = {
    user: null,
    loading: true,
    API: null,
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
                setUser({
                    name: currentUser,
                    cookie: currentUser,
                })
            // else logout()
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
                const cookie = Cookies.set(USER_COOKIE_KEY, username, {
                    sameSite: "Strict",
                })
                if (!cookie) throw new Error("Could not set the User Cookie!")
                setUser({ name: username, cookie: cookie })
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
                API: makeAPI(user!),
            }}
        >
            {props.children}
        </AuthContext.Provider>
    )
}
