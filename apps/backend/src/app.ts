import { Core, EventSystem } from "@intutable-org/core"
import { closeConnection, openConnection, select } from "@intutable-org/database/dist/requests"
import { schemaSetup } from "@intutable-org/dekanat-app-plugin/dist/initialSchema"
import { join } from "path"
import { getConfig } from "shared/dist/config"
import { waitForDatabase } from "./utils/waitForDatabase"

// BUG: dependency sorting seems to be not working,
// do not change this order for now
const PLUGIN_PATHS = [join(__dirname, "../../../node_modules/@intutable-org/*")]

/**
 * Start a {@link Core}. Since we have the HTTP plugin installed, it will keep
 * running and listen for requests.
 */
export async function app() {
    await waitForDatabase()

    const events = new EventSystem(true) // true: debug mode

    const core = await Core.create(PLUGIN_PATHS, events)

    // +++ example schema creation +++

    const config = getConfig()
    const connId = await core.events
        .request(openConnection(config.databaseAdminUsername, config.databaseAdminPassword))
        .then(({ connectionId }) => connectionId)

    try {
        // create some example data for testing, if none are present
        const project_count = await core.events.request(select(connId, "projects"))
        if (project_count.length === 0) {
            console.log("no projects found, set up example schema")
            await core.events.request(schemaSetup(connId))
        }
    } catch (e) {
        console.error("error while creating example schema:", e)
    } finally {
        await core.events.request(closeConnection(connId))
    }
}
