import { login } from "./login"
import { logout } from "./logout"
import { getCurrentUser } from "./utils/getCurrentUser"

export * from "../types/User"

export const Auth = {
    login,
    logout,
    getCurrentUser,
} as const
