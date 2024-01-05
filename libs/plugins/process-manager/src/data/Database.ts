import {
    closeConnection,
    createTable,
    insert,
    openConnection,
    listTables,
} from "@intutable-org/database/dist/requests"
import { CoreRequest, CoreResponse, PluginLoader } from "@intutable-org/core"
import { USERNAME, PASSWORD } from "../config/connection"
import { allTables } from "./schema"
import { Column } from "@intutable-org/database/dist/types"

let core: PluginLoader

export async function initDatabase(_core: PluginLoader) {
    core = _core

    const connectionId = (await core.events.request(openConnection(USERNAME, PASSWORD)))
        .connectionId

    const existingTables = (await core.events.request(listTables(connectionId))) || []

    let table: { schema: Column[]; data?: unknown[] }
    const coreRequests: Promise<CoreRequest>[] = Object.keys(allTables).map(
        async (tableId: string): Promise<CoreResponse> => {
            table = allTables[tableId]

            if (existingTables.indexOf(tableId) >= 0) {
                // table already exists
                return Promise.resolve()
            }

            return core.events.request(createTable(connectionId, tableId, table.schema)).then(
                function (
                    tableName: string,
                    tableData: unknown[] | undefined
                ): Promise<CoreResponse> {
                    if (!tableData) {
                        // no data for this table
                        return Promise.resolve()
                    }
                    return core.events.request(insert(connectionId, tableName, tableData))
                }.bind(null, tableId, table.data)
            )
        }
    )

    return Promise.all(coreRequests).finally(() =>
        core.events.request(closeConnection(connectionId))
    )
}
