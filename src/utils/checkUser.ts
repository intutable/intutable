import { User } from "types/User"

// Note: used in api routes to throw when the user is not logged in
export const checkUser = (user: User | undefined): User => {
    if (user && user.isLoggedIn) return user
    throw new Error("Could not get the user from session!")
}
