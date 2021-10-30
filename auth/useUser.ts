/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file useUser.ts
 * @description Custom Hook for User Authentication
 * @since 01.10.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules
import { useState, useEffect } from "react"

// Assets

// CSS

// Components

// Utils / Types / Api

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