import path from "path"
import { Core } from "@intutable/core"
import { SerializedColumn } from "../../shared/dist/types/tables"
import { emptyRowOptions } from "../../shared/dist/defaults"
import {
    openConnection,
    closeConnection,
    insert,
} from "@intutable/database/dist/requests"
import * as pm from "@intutable/project-management/dist/requests"
import {
    TableDescriptor as PmTable
} from "@intutable/project-management/dist/types"
import {
    types as lvt,
    requests as lvr,
    viewId,
    tableId
} from "@intutable/lazy-views"
import { ColumnType } from "@intutable/database/dist/types"
import { TableDescriptor } from "../src/types"
import { TableData, SerializedViewData } from "../src/types/tables"
import * as req from "../src/requests"

let core: Core
let sessionID: string

let DB_USERNAME = "admin"
let DB_PASSWORD = "admin"

const ADMIN_USER = "admin@dekanat.de"
const ADMIN_HASH = "asdfasdfasdfasdf" // not actually an argon2 hash
let ADMIN_ID: number
let PROJECT_ID: number

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
    const admin = await core.events.request(insert(sessionID, "users", {
        email: ADMIN_USER,
        password: ADMIN_HASH,
    }, ["_id"]))
    ADMIN_ID = admin._id
    const projDesc = await core.events.request(
        pm.createProject(sessionID, ADMIN_ID, "project")
    )
    PROJECT_ID = projDesc.id
})

afterAll(async () => {
    await core.events.request(closeConnection(sessionID))
    core.plugins.closeAll()
})

test("admin and project ID are set", async () => {
    expect(ADMIN_ID).toEqual(expect.any(Number))
    expect(PROJECT_ID).toEqual(expect.any(Number))
})

describe("create table", () => {
    const TABLE_NAME = "employees"
    let TABLE: TableDescriptor
    let DATA: TableData

    beforeAll(async () => {
        TABLE = await core.events.request(
            req.createTable(sessionID, PROJECT_ID, ADMIN_ID, TABLE_NAME)
        )
        DATA = await core.events.request(
            req.getTableData(sessionID, TABLE.id)
        )
    })

    afterAll(async () => {
        await core.events.request(
            req.deleteTable(sessionID, TABLE.id)
        )
    })

    test("table with appropriate columns exists", async () => {
        expect(DATA.columns.length).toBe(1)
        expect(DATA.columns).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                index: 2, // id: 0, (row)index: 1, name: 2
                name: "Name",
                kind: "standard",
                isUserPrimaryKey: true
            })
        ]))
        // check for hidden columns too
        const rawData = await core.events.request(
            lvr.getViewInfo(sessionID, TABLE.id)
        ) as lvt.ViewData
        expect(rawData.columns.length).toBe(3)
        expect(rawData.columns).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: "_id" }),
            expect.objectContaining({ name: "index" }),
            expect.objectContaining({ name: "name" }),
        ]))
    })
    test("table has default view", async () => {
        const views: lvt.ViewDescriptor[] = await core.events.request(
            req.listViews(sessionID, TABLE.id)
        )
        expect(views.length).toBe(1)
        const view: SerializedViewData = await core.events.request(
            req.getViewData(sessionID, views[0].id)
        )
        expect(view.descriptor.name).toBe("Standard")
        expect(view.metaColumns).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: "_id" }),
            expect.objectContaining({ name: "index" }),
            expect.objectContaining({ name: "name" }),
        ]))
    })
    test("delete table", async () => {
        const otherTableName = "departments"
        const otherTable: TableDescriptor = await core.events.request(
            req.createTable(sessionID, PROJECT_ID, ADMIN_ID, otherTableName)
        )
        await core.events.request(
            req.deleteTable(sessionID, otherTable.id)
        )
        let tables: PmTable[] = await core.events.request(
            pm.getTablesFromProject(sessionID, PROJECT_ID)
        )
        expect(tables).not.toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: otherTableName
            })
        ]))
    })
})

// TODO: get createView and createTable implemented first, because there
// are too many conditions that they create and that this method depends on...
// ugh.

// describe("create specialized columns", () => {
//     const TEST_TABLE_SPEC = {
//         name: "employees",
//         columns: [
//             { name: "Name", type: ColumnType.string },
//             { name: "department", type: ColumnType.string }
//         ]
//     }
//     let TEST_TABLE: lvt.ViewDescriptor
//     const TEST_VIEW_SPEC = {
//         name: "development"
//     }
//     let TEST_VIEW: lvt.ViewDescriptor

//     beforeAll(async () => {
//         const tableDesc = await core.events.request(
//             pm.createTableInProject(
//                 sessionID, ADMIN_ID, PROJECT_ID,
//                 TEST_TABLE_SPEC.name, TEST_TABLE_SPEC.columns
//             )
//         )
//         TEST_TABLE = await core.events.request(
//             lvr.createView(
//                 sessionID,
//                 tableId(tableDesc.id),
//                 TEST_TABLE_SPEC.name,
//                 { columns: [], joins: [] },
//                 emptyRowOptions()
//             )
//         ).catch(e => { console.dir(e); return Promise.reject(e) })
//         TEST_VIEW = await core.events.request(
//             lvr.createView(
//                 sessionID,
//                 viewId(TEST_TABLE.id),
//                 TEST_VIEW_SPEC.name,
//                 { columns: [], joins: [] },
//                 emptyRowOptions()
//             )
//         ).catch(e => { console.dir(e); return Promise.reject(e) })
//     })
//     test("create standard column", async () => {
//         const COLUMN_NAME = "salary"
//         const newColumn = await core.events.request(
//             createStandardColumn(
//                 sessionID,
//                 TEST_TABLE.id,
//                 {
//                     name: COLUMN_NAME,
//                     _cellContentType: "number",
//                     editable: true
//                 }
//             )
//         ) as SerializedColumn
//         expect(newColumn).toEqual(expect.objectContaining({
//             _kind: "standard",
//             userPrimary: false,
//             name: COLUMN_NAME,
//             key: COLUMN_NAME,
//         }))
//         const testViewInfo = await core.events.request(
//             lvr.getViewInfo(sessionID, TEST_VIEW.id)
//         ) as lvt.ViewInfo
//         const childColumn = testViewInfo.columns.find(
//             c => c.name === "salary"
//         )
//         expect(childColumn).toBeDefined()
//     })
// })
