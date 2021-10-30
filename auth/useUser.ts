import { useState, useEffect } from "react"

type UserCredentials = {

}

/**
 * Custom Hook to handle user authentication and state
 * @returns {[UserCredentials | null]} Either the user credentials object or null if no user is logged in
 */
const useUser = () => {

    const [user, setUser] = useState<UserCredentials | null>(null)

    useEffect(() => {

    }, [user])

    const logIn = () => { }
    const logOut = () => { }

    return [user, { logIn, logOut }]
}

export default useUser
