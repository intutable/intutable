import { useEffect, useState } from "react"

export type User = {
    name: string
}

export const useAuth = (user?: User) => {
    const [_user, _setUser] = useState<User | null>(user || null)

    useEffect(() => {}, [])

    const login = () => {
        console.log("login!!1")
    }
    return {
        user: _user,
        setUser: _setUser,
        login
    }
}
