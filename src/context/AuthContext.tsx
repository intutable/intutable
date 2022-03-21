import { Auth, User } from "auth"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

export const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!

export type AuthContextProps = {
    user: User | null
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const initialState: AuthContextProps = {
    user: null,
    loading: false,
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
            }}
        >
            {props.children}
        </AuthContext.Provider>
    )
}
