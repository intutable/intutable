import { login } from "./login"
import { logout } from "./logout"
import { getCurrentUser } from "./utils/getCurrentUser"

export * from "./types"

export const Auth = {
    login,
    logout,
    getCurrentUser,
} as const