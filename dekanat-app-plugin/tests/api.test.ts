import path from "path"
import { Core } from "@intutable/core"
import {
    openConnection,
    closeConnection,
    createTable,
    listTables,
} from "@intutable/database/dist/requests"
import { ColumnType } from "@intutable/database/dist/types"

let core: Core
let sessionID: string

let DB_USERNAME = "admin"
let DB_PASSWORD = "admin"

beforeAll(async () => {
    core = await Core.create(
        [
            path.join(__dirname, "../../node_modules/@intutable/*"),
            path.join(__dirname, ".."),
        ]
    )
    await core.events.request(
        openConnection(sessionID, DB_USERNAME, DB_PASSWORD)
    )
})

afterAll(async () => {
    await core.events.request(closeConnection(sessionID))
    core.plugins.closeAll()
})

test("connected to database container", async () => {
    const TABLE_NAME = "myawesometesttable"
    await core.events.request(createTable(sessionID, TABLE_NAME, [
        { name: "Name", type: ColumnType.string }
    ]))
    const list = await core.events.request(listTables(sessionID))
    expect(list).toEqual(expect.arrayContaining([TABLE_NAME]))
})
