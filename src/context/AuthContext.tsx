import { makeAPI } from "@app/api"
import { Auth } from "@app/auth"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

export const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!

/**
 * Authentication data of the current user.
 * @property {string} username
 * @property {number} id
 * @property {string | undefined} authCookie the back-end authentication
 * cookie. In front-end use, this is undefined, as the cookie is HttpOnly
 * and passed along automatically. Still necessary for SSR.
 */
export type CurrentUser = {
    username: string
    id: number
    authCookie: string | undefined
}

export type AuthContextProps = {
    user: CurrentUser | null
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
    API: ReturnType<typeof makeAPI> | null
}

const initialState: AuthContextProps = {
    user: null,
    loading: false,
    API: null,
    login: undefined!,
    logout: undefined!,
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
        ;(async () => {
            const user = await Auth.getCurrentUser()
            if (user) setUser(user)
        })()
    }, [])

    const login = async (username: string, password: string) => {
        setLoading(true)
        try {
            await logout()
            await Auth.login(username, password)
            const user = await Auth.getCurrentUser()
            setUser(user)
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        setLoading(true)
        return Auth.logout()
            .then(() => {
                setUser(null)
                router.push("/")
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
                API: user ? makeAPI(user) : null,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    )
}
