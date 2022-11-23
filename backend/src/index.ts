import { randomBytes } from "crypto"
import net from "net"
import path from "path"
import process from "process"
import { Core, EventSystem } from "@intutable/core"
import { openConnection, closeConnection, select, insert } from "@intutable/database/dist/requests"
import { getConfig } from "shared/dist/config"

import { createExampleSchema, insertExampleData } from "./example/load"

const PLUGIN_PATHS = [
    path.join(__dirname, "../../node_modules/@intutable/*"),
    path.join(__dirname, "../../dekanat-app-plugin"),
]
const PG_PORT = 5432
const RETRIES = Math.pow(2, 30)

// default credentials, if none are specified in the config:
let ADMIN_USERNAME: string
let ADMIN_PASSWORD: string
let adminId: number

let core: Core

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

    core = await Core.create(PLUGIN_PATHS, events).catch(e => crash<Core>(e))

    const sessionID = "dekanat-app-backend_" + randomBytes(20).toString("hex")

    await core.events.request(openConnection(sessionID, config.databaseAdminUsername, config.databaseAdminPassword))

    try {
        // create some custom data
        const maybeAdminId = await getAdminId(sessionID)
        if (maybeAdminId === null) {
            adminId = await createAdmin(sessionID)
            console.log("set up admin user")
        } else {
            adminId = maybeAdminId
            console.log("admin user already present")
        }

        // testing data
        if (maybeAdminId === null) {
            console.log("creating and populating example schema")
            await createExampleSchema(core, sessionID, adminId)
            await insertExampleData(core, sessionID)
        } else console.log("skipped creating example schema")
    } finally {
        await core.events.request(closeConnection(sessionID))
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
    console.log(e)
    return process.exit(1)
}

/** Get the ID of the admin user (if they exist) */
async function getAdminId(sessionID: string): Promise<number | null> {
    const userRows = await core.events.request(
        select(sessionID, "users", {
            columns: ["_id"],
            condition: ["email", ADMIN_USERNAME],
        })
    )
    if (userRows.length > 1) return Promise.reject("fatal: multiple users with same name exist")
    else if (userRows.length === 1) return userRows[0]["_id"]
    else return null
}

/** Create an example admin user for dev mode */
async function createAdmin(sessionID: string): Promise<number> {
    const passwordHash: string = await core.events
        .request({
            channel: "user-authentication",
            method: "hashPassword",
            password: ADMIN_PASSWORD,
        })
        .then(response => response.hash)
    await core.events.request(
        insert(sessionID, "users", {
            email: ADMIN_USERNAME,
            password: passwordHash,
        })
    )
    return getAdminId(sessionID).then(definitelyNumber => definitelyNumber!)
}
