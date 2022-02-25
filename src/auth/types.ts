/**
 * Authentication data of the current user.
 * @property {string} username
 * @property {number} id
 * @property {string | undefined} authCookie the back-end authentication
 * cookie. In front-end use, this is undefined, as the cookie is HttpOnly
 * and passed along automatically. Still necessary for SSR.
 */
export type User = {
    username: string
    id: number
    authCookie: string | undefined
}
