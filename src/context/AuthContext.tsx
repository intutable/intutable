import React, { useContext, useEffect, useState } from "react"
import Cookie from "js-cookie"
import { useRouter } from "next/router"

import { coreLogin, coreLogout } from "@utils/coreinterface"


export type User = {
    name: string
}

export type AuthContextProps = {
    user: User | null
    loading: boolean
    login?: (username, password: string) => Promise<User>
    logout?: () => void
}

const initialState: AuthContextProps = {
    user: null,
    loading: true,
}

const AuthContext = React.createContext<AuthContextProps>(initialState)
export const useAuth = () => React.useContext(AuthContext)
export const AuthProvider: React.FC = props => {
    const router = useRouter()
    const [loading, setLoading] = useState<Pick<AuthContextProps, "loading">["loading"]>(
        initialState.loading
    )
    const [user, setUser] = useState<Pick<AuthContextProps, "user">["user"]>(initialState.user)

    useEffect(() => {
        // checks if a user is already logged in
        ;(async _ => {
            // TODO: implement this
            const RENAME_THIS_TOKEN = Cookie.get("")
            if (RENAME_THIS_TOKEN) {
                const user = null
                if (user) setUser(user)
            }
            setLoading(false)
        })()
    }, [])

    const login = async (username, password) : Promise<User> => {
        return coreLogin(username, password)
            .then(username => {
                console.log("Login successful. username=" + username)
                setUser({ name : username })
            }).catch(e => {
                console.log(e)
                return Promise.reject(e)
            })
    }

    const logout = async () => {
        return coreLogout()
            .then(() => setUser(null))
            .catch(e => console.log("logout failed: " + e))
        router.push("/")
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
