import { useEffect, useState } from "react"

export type User = {
    name: string
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {}, [])

    return {
        user,
    }
}
