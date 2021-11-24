import React, { useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/router"

import { coreLogin,
         coreLogout,
         isAuthenticated
} from "@utils/coreinterface/login"


export const USER_COOKIE_KEY = "dekanat.mathinf.user"


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
            if (currentUser && await isAuthenticated())
                setUser({ name: currentUser })
            else
                logout()
            setLoading(false)
        })()
    }, [])

    /*
       As of now, there are 3 stateful components to being logged in: The core
       authentication (managed via a passport js cookie), the currentUser
       cookie (front-end remembering who was logged in), and the `user` hook
       (for keeping graphical elements up to date)
     */
    const login = async (username, password): Promise<User> => {
        await coreLogout()
        return coreLogin(username, password)
            .then(() => {
                setUser({ name: username })
                Cookies.set(USER_COOKIE_KEY, username, { sameSite: "Strict" })
            })
            .catch(e => {
                return Promise.reject(e)
            })
    }

    const logout = async () => {
        return coreLogout()
            .then(() => {
                setUser(null)
                Cookies.remove(USER_COOKIE_KEY)
                router.push("/login")
            })
            .catch(e => console.log("logout failed: " + e))
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout
            }}
        >
            {props.children}
        </AuthContext.Provider>
    )
}
