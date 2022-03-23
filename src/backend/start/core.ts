import path from "path"
import process from "process"
import net from "net"

import { Core, EventSystem } from "@intutable/core"
import cors from "cors"
import { addMiddleware } from "@intutable/http"

import { getFrontendUrl } from "../runtimeconfig"

const PLUGIN_PATHS = [path.join(process.cwd(), "node_modules/@intutable/*")]
const PG_PORT = 5432
const RETRIES = 5


main()

/**
 * Start a {@link Core}. Since we have the HTTP plugin installed, it will keep
 * running and listen for requests.
 */
async function main() {
    await waitForDatabase()
        .catch(e => crash<Core>(e))
    const events: EventSystem = new EventSystem(true) // debug mode
    const core: Core = await Core.create(PLUGIN_PATHS, events)
        .catch(e => crash<Core>(e)
    )
}

async function waitForDatabase() {
    let connected: boolean = false
    let lastError: unknown
    let retries = RETRIES
    while(retries > 0 && !connected){
        console.log(`${path.basename(__filename)}: waiting for database...`)
        console.log(`${path.basename(__filename)}: retries: ${retries}`)
        await testPort(PG_PORT)
            .then(r => { connected = true })
            .catch(e => { lastError = e })
        await new Promise((res, rej) => setTimeout(res, 1000))
        retries--
    }
    if (connected){
        return
    } else {
        return Promise.reject({ error: {
            message: "could not connect to database",
            reason: lastError
        }})
    }
}

async function testPort(port, host?){
    let socket: net.Socket
    return new Promise((res, rej) => {
        socket = net.createConnection(port, host)
        socket
            .on("connect", function(e){
                res(e)
                socket.destroy()
            })
            .on("error", function(e){
                rej(e)
                socket.destroy()
            })
    })
}

// The type system apparently knows that process.exit has bottom type!
function crash<A>(e: Error): A {
    console.log(e)
    return process.exit(1)
}
