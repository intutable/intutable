import type { Role } from "../../../../libs/dekanat-app-plugin/dist/permissions/types"

export type User = {
    username: string
    authCookie: string
    id: number
    isLoggedIn: boolean
    role: Role
}
