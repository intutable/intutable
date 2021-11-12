import path from "path"
import process from "process"

import { Core, EventSystem } from "@intutable/core"
import cors from "cors"
import { addMiddleware } from "@intutable/http"

import { getFrontendUrl } from "../runtimeconfig"

const PLUGIN_PATHS =
    ["database","http", "user-authentication", "project-management"].map(
        (plugin) => path.join(process.cwd(), "node_modules/@intutable", plugin))


main()

/**
 * Start a {@link Core}. Since we have the HTTP plugin installed, it will keep
 * running and listen for requests.
 */
async function main(){
    const events : EventSystem = new EventSystem(true) // debug mode
    const core : Core = await Core.create(PLUGIN_PATHS, events)
        .catch(e => crash<Core>(e))
    await core.events.request(
        addMiddleware(cors({
            origin : getFrontendUrl(),
            credentials: true }))
    ).catch(crash)
}

// The type system apparently knows that process.exit has bottom type!
function crash<A>(e : Error) : A {
    console.log(e)
    return process.exit(1)
}
