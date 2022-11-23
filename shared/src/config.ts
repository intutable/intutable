import { readFileSync } from "fs"

/**
 * Configuration options:
 * @prop {string} databaseAdminUsername Name of the admin role in the database.
 * @prop {string} databaseAdminPassword Password of the admin role in the
 * database
 * @prop {string} appAdminUsername Login name of the application admin user.
 * @prop {string} appAdminPassword Password of the application admin user.
 */
export type Config = {
    databaseAdminUsername: string
    databaseAdminPassword: string
    appAdminUsername: string
    appAdminPassword: string
}
export function getConfig(): Config {
    const configText = readFileSync(`${__dirname}/../config.json`, {
        encoding: "utf8",
    })
    const configJson = JSON.parse(configText)
    const databaseAdminUsername: string = configJson.databaseAdminUsername
    const databaseAdminPassword: string = configJson.databaseAdminPassword
    const appAdminUsername: string = configJson.appAdminUsername
    const appAdminPassword: string = configJson.appAdminPassword
    if (typeof databaseAdminUsername !== "string" || typeof databaseAdminPassword !== "string") {
        // the error sometimes just causes silent failure
        console.log("error: database credentials not present in config file")
        throw TypeError("database credentials not present in config file")
    }
    if (typeof appAdminUsername !== "string" || typeof appAdminPassword !== "string") {
        // the error sometimes just causes silent failure
        console.log("error: admin user credentials not present in config file")
        throw TypeError("admin user credentials not present in config file")
    }
    return {
        databaseAdminUsername,
        databaseAdminPassword,
        appAdminUsername,
        appAdminPassword,
    }
}
