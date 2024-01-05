import { PLUGIN_NAME } from "./internal"

export const USERNAME_ENV_KEY = "DB_RDONLY_USERNAME"
export const PASSWORD_ENV_KEY = "DB_RDONLY_PASSWORD"
export const SECRET_ENV_KEY = "CORE_USER_AUTH_SECRET"

export const DEFAULT_DB_USERNAME = "admin"
export const DEFAULT_DB_PASSWORD = "admin"
export const DEFAULT_SECRET = "this is the opposite of secret"

/**
 * Get the app secrets from the environment. If any is not set, use a default
 * value.
 * @param {boolean} warnOnDefault whether or not to log a warning message
 * when a default is used.
 */
export function getEnvironmentVariables(warnOnDefault: boolean = false): {
    dbUsername: string
    dbPassword: string
    secret: string
} {
    let dbUsername = process.env[USERNAME_ENV_KEY]
    if (!dbUsername) {
        if (warnOnDefault) console.log(defaultValueWarning("database username"))
        dbUsername = DEFAULT_DB_USERNAME
    }
    let dbPassword = process.env[PASSWORD_ENV_KEY]
    if (!dbPassword) {
        if (warnOnDefault) console.log(defaultValueWarning("database password"))
        dbPassword = DEFAULT_DB_PASSWORD
    }
    let secret = process.env[SECRET_ENV_KEY]
    if (!secret) {
        if (warnOnDefault) console.log(defaultValueWarning("session secret"))
        secret = DEFAULT_SECRET
    }
    return { dbUsername, dbPassword, secret }
}
function defaultValueWarning(varName: string): string {
    return (
        `${PLUGIN_NAME}: no ${varName} found in` +
        " process environment. Defaulting to hard-coded value," +
        " which is a security risk."
    )
}
