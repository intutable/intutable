import net from "net"
import path from "path"
import process from "process"
import { Core, EventSystem } from "@intutable/core"
import { openConnection, closeConnection, select, insert } from "@intutable/database/dist/requests"
import { getConfig } from "shared/dist/config"

import { setCore, getCore as core } from "./core"
import { createExampleSchema, insertExampleData } from "./example/load"

const PLUGIN_PATHS = [
    path.join(__dirname, "../../node_modules/@intutable/*"),
    path.join(__dirname, "../../dekanat-app-plugin"),
]
const PG_PORT = 5432
const RETRIES = 10

// default credentials, if none are specified in the config:
let ADMIN_USERNAME: string
let ADMIN_PASSWORD: string
let ADMIN_ID: number

// Relic of PM's user management. We just have one role that owns everything,
// restricting access is then up to a dedicated permission plugin.
let PM_ROLE_ID: number

main()

/**
 * Start a {@link Core}. Since we have the HTTP plugin installed, it will keep
 * running and listen for requests.
 */
async function main() {
    await waitForDatabase().catch(e => crash<Core>(e))
    const devMode = process.argv.includes("dev") // what could go wrong?
    const events: EventSystem = new EventSystem(devMode) // flag sets debug mode

    const config = getConfig()
    ADMIN_USERNAME = config.appAdminUsername
    ADMIN_PASSWORD = config.appAdminPassword
    PM_ROLE_ID = config.projectManagementRoleId

    setCore(await Core.create(PLUGIN_PATHS, events).catch(e => crash<Core>(e)))

    const connId = await core()
        .events.request(openConnection(config.databaseAdminUsername, config.databaseAdminPassword))
        .then(({ connectionId }) => connectionId)

    try {
        // create some example data for testing, if none are present
        const project_count = await core().events.request(select(connId, "projects"))
        if (project_count.length === 0) {
            await createExampleSchema(connId, PM_ROLE_ID)
            await insertExampleData(connId)
            console.log("set up example schema")
        } else {
            console.log("admin user already present")
            console.log("skipped creating example schema")
        }
    } finally {
        await core().events.request(closeConnection(connId))
    }
}

async function waitForDatabase() {
    let connected = false
    let lastError: unknown
    let retries = RETRIES
    while (retries > 0 && !connected) {
        console.log(`waiting for database...`)
        console.log(`retries: ${retries}`)
        await testPort(PG_PORT)
            .then(() => {
                connected = true
            })
            .catch(e => {
                lastError = e
            })
        await new Promise(res => setTimeout(res, 3000))
        retries--
    }
    if (connected) {
        return
    } else {
        return Promise.reject({
            error: {
                message: "could not connect to database",
                reason: lastError,
            },
        })
    }
}

async function testPort(port: number, host?: string) {
    let socket: net.Socket
    return new Promise((res, rej) => {
        socket = net.createConnection(port, host)
        socket
            .on("connect", function (e: Event) {
                res(e)
                socket.destroy()
            })
            .on("error", function (e: Event) {
                rej(e)
                socket.destroy()
            })
    })
}

function crash<A>(e: Error): A {
    console.error(e)
    return process.exit(1)
}

/** Get the ID of the admin user (if they exist) */
async function getAdminId(connectionId: string): Promise<number | null> {
    const userRows = await core().events.request(
        select(connectionId, "users", {
            columns: ["_id"],
            condition: ["username", ADMIN_USERNAME],
        })
    )
    if (userRows.length > 1) return Promise.reject("fatal: multiple users with same name exist")
    else if (userRows.length === 1) return userRows[0]["_id"]
    else return null
}

/** Create an example admin user for dev mode */
async function createAdmin(connectionId: string): Promise<number> {
    const passwordHash: string = await core()
        .events.request({
            channel: "user-authentication",
            method: "hashPassword",
            password: ADMIN_PASSWORD,
        })
        .then(response => response.hash)
    await core().events.request(
        insert(connectionId, "users", {
            username: ADMIN_USERNAME,
            password: passwordHash,
        })
    )
    return getAdminId(connectionId).then(definitelyNumber => definitelyNumber!)
}
