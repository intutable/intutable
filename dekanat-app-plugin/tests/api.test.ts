import path from "path"
import { Core } from "@intutable/core"
import {
    openConnection,
    closeConnection,
    insert,
} from "@intutable/database/dist/requests"
import * as pm from "@intutable/project-management/dist/requests"
import {
    TableDescriptor as PmTable
} from "@intutable/project-management/dist/types"
import { types as lvt, requests as lvr } from "@intutable/lazy-views"
import { COLUMN_INDEX_KEY, defaultViewName } from "shared/dist/api"
import { TableDescriptor, ViewDescriptor } from "../src/types"
import {
    TableData,
    SerializedViewData,
    SerializedColumn
} from "../src/types/tables"
import * as req from "../src/requests"
import { ErrorCode } from "../src/error"

let core: Core
let connId: string

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
    connId = await core.events.request(
        openConnection(DB_USERNAME, DB_PASSWORD)
    ).then(({ connectionId }) => connectionId)
    const admin = await core.events.request(insert(connId, "users", {
        username: ADMIN_USER,
        password: ADMIN_HASH,
    }, ["_id"]))
    ADMIN_ID = admin._id
    const projDesc = await core.events.request(
        pm.createProject(connId, ADMIN_ID, "project")
    )
    PROJECT_ID = projDesc.id
})

afterAll(async () => {
    await core.events.request(closeConnection(connId))
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
            req.createTable(connId, ADMIN_ID, PROJECT_ID, TABLE_NAME)
        )
        DATA = await core.events.request(
            req.getTableData(connId, TABLE.id)
        )
    })

    afterAll(async () => {
        await core.events.request(
            req.deleteTable(connId, TABLE.id)
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
            lvr.getViewInfo(connId, TABLE.id)
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
            req.listViews(connId, TABLE.id)
        )
        expect(views.length).toBe(1)
        const view: SerializedViewData = await core.events.request(
            req.getViewData(connId, views[0].id)
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
            req.createTable(connId, ADMIN_ID, PROJECT_ID, otherTableName)
        )
        await core.events.request(
            req.deleteTable(connId, otherTable.id)
        )
        let tables: PmTable[] = await core.events.request(
            pm.getTablesFromProject(connId, PROJECT_ID)
        )
        expect(tables).not.toEqual(expect.arrayContaining([
            expect.objectContaining({
                name: otherTableName
            })
        ]))
    })
})

describe("create view", () => {
    const TABLE_NAME = "Employees"
    const VIEW_NAME = "Developers"
    const NEW_NAME = "Layabouts"
    let TABLE: TableDescriptor
    let VIEW: ViewDescriptor

    async function createView(){
        VIEW = await core.events.request(
            req.createView(connId, TABLE.id, VIEW_NAME)
        )
    }
    async function deleteView(){
        await core.events.request(
            req.deleteView(connId, VIEW.id)
        )
    }
    beforeAll(async () => {
        TABLE = await core.events.request(
            req.createTable(connId, ADMIN_ID, PROJECT_ID, TABLE_NAME)
        )
    })

    afterAll(async () => {
        await core.events.request(
            req.deleteTable(connId, TABLE.id)
        )
    })

    test("create/delete view", async () => {
        await createView()
        let views = await core.events.request(
            req.listViews(connId, TABLE.id)
        ) as ViewDescriptor[]
        expect(views).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: defaultViewName() }),
            expect.objectContaining({ name: VIEW_NAME }),
        ]))

        const viewData = await core.events.request(
            req.getViewData(connId, VIEW.id)
        ) as SerializedViewData
        expect(viewData.columns).toEqual(expect.arrayContaining([
            expect.objectContaining({ [COLUMN_INDEX_KEY]: 2, name: "Name" })
        ]))

        await deleteView()
        views = await core.events.request(
            req.listViews(connId, TABLE.id)
        ) as ViewDescriptor[]
        expect(views).not.toEqual(expect.arrayContaining([
            expect.objectContaining({ name: defaultViewName() }),
            expect.objectContaining({ name: VIEW_NAME }),
        ]))
    })
    test("rename view", async () => {
        await createView()
        await core.events.request(req.renameView(connId, VIEW.id, NEW_NAME))
        let views = await core.events.request(
            req.listViews(connId, TABLE.id)
        ) as ViewDescriptor[]
        expect(views).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: defaultViewName() }),
            expect.objectContaining({ name: NEW_NAME }),
        ]))
        await deleteView()
    })

    test("cannot rename or delete default view", async () => {
        let views = await core.events.request(
            req.listViews(connId, TABLE.id)
        ) as ViewDescriptor[]
        const defaultView = views.find(v => v.name === defaultViewName())
        const deletePromise = core.events.request(
            req.deleteView(connId, defaultView.id)
        )
        expect(deletePromise).rejects.toEqual(expect.objectContaining({
            code: ErrorCode.changeDefaultView
        }))
        const renamePromise = core.events.request(
            req.renameView(connId, defaultView.id, NEW_NAME)
        )
        expect(renamePromise).rejects.toEqual(expect.objectContaining({
            code: ErrorCode.changeDefaultView
        }))
    })
})

describe("create different kinds of columns", () => {
    const TABLE_SPEC = {
        name: "employees",
        columns: [
            { name: "Department", cellType: "string", editable: true },
            { name: "Salary", cellType: "number", editable: true}
        ]
    }
    let TEST_TABLE: TableDescriptor

    beforeAll(async () => {
        TEST_TABLE = await core.events.request(
            req.createTable(connId, ADMIN_ID, PROJECT_ID, TABLE_SPEC.name)
        )
    })

    test("create standard column", async () => {
        const column = TABLE_SPEC.columns[0]
        const newColumn = await core.events.request(
            req.createStandardColumn(
                connId,
                TEST_TABLE.id,
                column,
            )
        ) as SerializedColumn
        
        expect(newColumn).toEqual(expect.objectContaining({
            kind: "standard",
            isUserPrimaryKey: false,
            name: column.name,
            key: expect.any(String),
            cellType: expect.stringContaining(column.cellType),
        }))

        // make sure column also exists in the view
        const testViewData = await core.events.request(
            req.getViewData(connId, TEST_TABLE.id)
        ) as SerializedViewData
        const childColumn = testViewData.columns.find(
            c => c.name === column.name
        )
        expect(childColumn).toBeDefined()
    })
})
