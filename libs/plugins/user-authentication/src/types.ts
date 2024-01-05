export interface User {
    id: number
    username: string
}

export interface AuthenticatedUser extends User {
    password: string
}

export interface Message {
    message: string
}
