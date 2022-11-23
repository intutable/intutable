import { readFileSync } from "fs"

/**
 * Configuration options:
 * @prop {string} databaseAdminUsername Name of the admin role in the database.
 * @prop {string} databaseAdminPassword Password of the admin role in the
 * database
 * @prop {string} appAdminUsername Login name of the application admin user.
 * @prop {string} appAdminPassword Password of the application admin user.
 * @prop {number} projectManagementRoleId The ID of the role that owns all
 * projects in project-management (it used to have its own roles (users) but
 * these are obsolete, so we just have a single role with access to everything
 * and the dedicated permission plugin can then have control of access
 * restrictions.
 */
export type Config = {
    databaseAdminUsername: string
    databaseAdminPassword: string
    appAdminUsername: string
    appAdminPassword: string
    projectManagementRoleId: number
}
export function getConfig(): Config {
    const configFilePath = `${__dirname}/../config.json`
    const configText = readFileSync(configFilePath, {
        encoding: "utf8",
    })
    const confName = `config file ${configFilePath}`

    const configJson = JSON.parse(configText)
    const databaseAdminUsername: string = configJson.databaseAdminUsername
    const databaseAdminPassword: string = configJson.databaseAdminPassword
    const appAdminUsername: string = configJson.appAdminUsername
    const appAdminPassword: string = configJson.appAdminPassword
    const projectManagementRoleId: string = configJson.projectManagementRoleId
    if (typeof databaseAdminUsername !== "string" || typeof databaseAdminPassword !== "string") {
        // the error sometimes just causes silent failure
        console.error(`error: no database credentials found in ${confName}`)
        throw TypeError(`no database credentials found in ${confName}`)
    }
    if (typeof appAdminUsername !== "string" || typeof appAdminPassword !== "string") {
        // the error sometimes just causes silent failure
        console.error(`error: no admin user credentials found in ${confName}`)
        throw TypeError(`no admin user credentials found in ${confName}`)
    }
    if (typeof projectManagementRoleId !== "number") {
        console.error(`error: no project management role found in ${confName}`)
        throw TypeError(`no project management role found in ${confName}`)
    }
    return {
        databaseAdminUsername,
        databaseAdminPassword,
        appAdminUsername,
        appAdminPassword,
        projectManagementRoleId,
    }
}
