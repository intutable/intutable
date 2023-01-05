import path from "path"
import { Core, CoreRequest } from "@intutable/core"
import { openConnection, closeConnection, insert } from "@intutable/database/dist/requests"
import * as pm from "@intutable/project-management/dist/requests"
import { TableDescriptor as PmTable } from "@intutable/project-management/dist/types"
import { types as lvt, requests as lvr } from "@intutable/lazy-views"
import { COLUMN_INDEX_KEY, defaultViewName, userPrimaryColumnName } from "shared/dist/api"
import { TableDescriptor, ViewDescriptor } from "shared/dist/types"
import { TableData, SerializedViewData, SerializedColumn } from "../src/types/tables"
import * as req from "../src/requests"
import { ErrorCode } from "../src/error"

let core: Core
let connId: string

const DB_USERNAME = "admin"
const DB_PASSWORD = "admin"

const ADMIN_USER = "admin@dekanat.de"
const ADMIN_HASH = "asdfasdfasdfasdf" // not actually an argon2 hash
let ADMIN_ID: number
let PROJECT_ID: number

beforeAll(async () => {
    core = await Core.create([path.join(__dirname, "../../node_modules/@intutable/*"), path.join(__dirname, "..")])
    connId = await core.events
        .request(openConnection(DB_USERNAME, DB_PASSWORD))
        .then(({ connectionId }) => connectionId)
    const admin = await core.events.request(
        insert(
            connId,
            "users",
            {
                username: ADMIN_USER,
                password: ADMIN_HASH,
            },
            ["_id"]
        )
    )
    ADMIN_ID = admin._id
    const projDesc = await core.events.request(pm.createProject(connId, ADMIN_ID, "project"))
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
        TABLE = await core.events.request(req.createTable(connId, ADMIN_ID, PROJECT_ID, TABLE_NAME))
        DATA = await core.events.request(req.getTableData(connId, TABLE.id))
    })

    afterAll(async () => {
        await core.events.request(req.deleteTable(connId, TABLE.id))
    })

    test("table with appropriate columns exists", async () => {
        expect(DATA.columns.length).toBe(1)
        expect(DATA.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    index: 2, // id: 0, (row)index: 1, name: 2
                    name: userPrimaryColumnName(),
                    kind: "standard",
                    isUserPrimaryKey: true,
                }),
            ])
        )
        // check for hidden columns too
        const rawData = (await core.events.request(lvr.getViewInfo(connId, TABLE.id))) as lvt.ViewData
        expect(rawData.columns.length).toBe(3)
        expect(rawData.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: "_id" }),
                expect.objectContaining({ name: "index" }),
                expect.objectContaining({ name: "name" }),
            ])
        )
    })
    test("table has default view", async () => {
        const views: lvt.ViewDescriptor[] = await core.events.request(req.listViews(connId, TABLE.id))
        expect(views.length).toBe(1)
        const view: SerializedViewData = await core.events.request(req.getViewData(connId, views[0].id))
        expect(view.descriptor.name).toBe("Standard")
        expect(view.metaColumns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: "_id" }),
                expect.objectContaining({ name: "index" }),
                expect.objectContaining({ name: "name" }),
            ])
        )
    })
    test("delete table", async () => {
        const otherTableName = "departments"
        const otherTable: TableDescriptor = await core.events.request(
            req.createTable(connId, ADMIN_ID, PROJECT_ID, otherTableName)
        )
        await core.events.request(req.deleteTable(connId, otherTable.id))
        const tables: PmTable[] = await core.events.request(pm.getTablesFromProject(connId, PROJECT_ID))
    })
})

describe("create view", () => {
    const TABLE_NAME = "Employees"
    const VIEW_NAME = "Developers"
    const NEW_NAME = "Layabouts"
    let TABLE: TableDescriptor
    let VIEW: ViewDescriptor

    async function createView() {
        VIEW = await core.events.request(req.createView(connId, TABLE.id, VIEW_NAME))
    }
    async function deleteView() {
        await core.events.request(req.deleteView(connId, VIEW.id))
    }
    beforeAll(async () => {
        TABLE = await core.events.request(req.createTable(connId, ADMIN_ID, PROJECT_ID, TABLE_NAME))
    })

    afterAll(async () => {
        await core.events.request(req.deleteTable(connId, TABLE.id))
    })

    test("create/delete view", async () => {
        await createView()
        let views = (await core.events.request(req.listViews(connId, TABLE.id))) as ViewDescriptor[]
        expect(views).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: defaultViewName() }),
                expect.objectContaining({ name: VIEW_NAME }),
            ])
        )

        const viewData = (await core.events.request(req.getViewData(connId, VIEW.id))) as SerializedViewData
        expect(viewData.columns).toEqual(
            expect.arrayContaining([expect.objectContaining({ [COLUMN_INDEX_KEY]: 2, name: userPrimaryColumnName() })])
        )

        await deleteView()
        views = (await core.events.request(req.listViews(connId, TABLE.id))) as ViewDescriptor[]
        expect(views).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: defaultViewName() }),
                expect.objectContaining({ name: VIEW_NAME }),
            ])
        )
    })
    test("rename view", async () => {
        await createView()
        await core.events.request(req.renameView(connId, VIEW.id, NEW_NAME))
        const views = (await core.events.request(req.listViews(connId, TABLE.id))) as ViewDescriptor[]
        expect(views).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: defaultViewName() }),
                expect.objectContaining({ name: NEW_NAME }),
            ])
        )
        await deleteView()
    })

    test("cannot rename or delete default view", async () => {
        const views = (await core.events.request(req.listViews(connId, TABLE.id))) as ViewDescriptor[]
        const defaultView = views.find(v => v.name === defaultViewName())
        const deletePromise = core.events.request(req.deleteView(connId, defaultView!.id))
        expect(deletePromise).rejects.toEqual(
            expect.objectContaining({
                code: ErrorCode.changeDefaultView,
            })
        )
        const renamePromise = core.events.request(req.renameView(connId, defaultView!.id, NEW_NAME))
        expect(renamePromise).rejects.toEqual(
            expect.objectContaining({
                code: ErrorCode.changeDefaultView,
            })
        )
    })
})

describe("create different kinds of columns", () => {
    const TABLE_SPEC = {
        name: "employees",
        columns: [
            { name: "Department", cellType: "string", editable: true },
            { name: "Salary", cellType: "number", editable: true },
        ],
    }
    let TEST_TABLE: TableDescriptor

    beforeAll(async () => {
        TEST_TABLE = await core.events.request(req.createTable(connId, ADMIN_ID, PROJECT_ID, TABLE_SPEC.name))
    })

    test("create standard column", async () => {
        const column = TABLE_SPEC.columns[0]
        const newColumn = (await core.events.request(
            req.createStandardColumn(connId, TEST_TABLE.id, column)
        )) as SerializedColumn

        expect(newColumn).toEqual(
            expect.objectContaining({
                kind: "standard",
                isUserPrimaryKey: false,
                name: column.name,
                key: expect.any(String),
                cellType: expect.stringContaining(column.cellType),
            })
        )

        // make sure column also exists in the view
        const testViewData = (await core.events.request(req.getViewData(connId, TEST_TABLE.id))) as SerializedViewData
        const childColumn = testViewData.columns.find(c => c.name === column.name)
        expect(childColumn).toBeDefined()
    })
})

function coreRequest<A = unknown>(request: CoreRequest): Promise<A> {
    return core.events.request(request) as Promise<A>
}

describe("row handling", () => {
    const TABLE_SPEC = {
        name: "table",
        columns: {
            age: { name: "Age", cellType: "number" }
        }
    }
    let table: TableDescriptor
    let view: ViewDescriptor
    /**
     * This object will be overwritten throughout the tests, but only under the following
     * invariant: all properties of viewData (except `rows`) remain constant through all tests
     */
    let viewData: SerializedViewData
    let nameColumn: SerializedColumn
    let ageColumn: SerializedColumn

    beforeAll(async () => {
        table = await coreRequest<TableDescriptor>(
            req.createTable(connId, ADMIN_ID, PROJECT_ID, TABLE_SPEC.name)
        )
        const views = await coreRequest<ViewDescriptor[]>(
            req.listViews(connId, table.id)
        )
        view = views.find(v => v.name === defaultViewName())!
        await coreRequest(req.createStandardColumn(connId, table.id, TABLE_SPEC.columns.age))
        // should contain the columns now...
        viewData = await coreRequest<SerializedViewData>(req.getViewData(connId, view.id))
        nameColumn = viewData.columns.find(c => c.name === userPrimaryColumnName())!
        ageColumn = viewData.columns.find(c => c.name === TABLE_SPEC.columns.age.name)!
    })

    afterAll(async () => {
        await coreRequest(req.deleteTable(connId, table.id))
    })

    test("create a new empty row, update data", async () => {
        const { _id } = await coreRequest<{ _id: number }>(req.createRow(connId, view.id))
        viewData = await coreRequest<SerializedViewData>(req.getViewData(connId, view.id))
        expect(viewData.rows).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: expect.any(Number),
                index: viewData.rows.length - 1,
                [nameColumn.key]: null,
                [ageColumn.key]: null,
            })
        ]))
        const { rowsUpdated } = await coreRequest<{ rowsUpdated: number }>(
            req.updateRows(connId, view.id, _id, { [nameColumn.id]: "Jenny", [ageColumn.id]: "18" })
        )
        expect(rowsUpdated).toBe(1)
        viewData = await coreRequest<SerializedViewData>(req.getViewData(connId, view.id))
        expect(viewData.rows).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: expect.any(Number),
                index: viewData.rows.length - 1,
                [nameColumn.key]: "Jenny",
                [ageColumn.key]: "18",
            })
        ]))
    })
    test("create a new row with given values", async () => {
        await coreRequest(
            req.createRow(connId, view.id, {
                values: { [nameColumn.id]: "Jeff", [ageColumn.id]: "23",}
            })
        )
        viewData = await coreRequest<SerializedViewData>(req.getViewData(connId, view.id))
        expect(viewData.rows).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: expect.any(Number),
                index: viewData.rows.length - 1,
                [nameColumn.key]: "Jeff",
                [ageColumn.key]: "23",
            })
        ]))
    })
    test("create a new empty row at a desired index; batch update", async () => {
        const { _id: _id1 } = await coreRequest<{ _id: number }>(req.createRow(connId, view.id, {
            values: {
                [nameColumn.id]: "Second",
                [ageColumn.id]: "2",
            }            
        }))
        const { _id: _id2 } = await coreRequest<{_id: number }>(req.createRow(connId, view.id, {
            atIndex: 0,
            values: {
                [nameColumn.id]: "First",
                [ageColumn.id]: "1",
            }            
        }))
        viewData = await coreRequest<SerializedViewData>(req.getViewData(connId, view.id))
        expect(viewData.rows).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: expect.any(Number),
                index: 0,
                [nameColumn.key]: "First",
                [ageColumn.key]: "1",
            }),
            expect.objectContaining({
                _id: expect.any(Number),
                index: viewData.rows.length - 1,
                [nameColumn.key]: "Second",
                [ageColumn.key]: "2",
            })
        ]))
        const { rowsUpdated } = await coreRequest<{ rowsUpdated: number }>(
            req.updateRows(connId, view.id, [_id1, _id2], { [ageColumn.id]: "3" })
        )
        expect(rowsUpdated).toBe(2)
        viewData = await coreRequest<SerializedViewData>(req.getViewData(connId, view.id))
        expect(viewData.rows).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: expect.any(Number),
                index: 0,
                [nameColumn.key]: "First",
                [ageColumn.key]: "3",
            }),
            expect.objectContaining({
                _id: expect.any(Number),
                index: viewData.rows.length - 1,
                [nameColumn.key]: "Second",
                [ageColumn.key]: "3",
            })
        ]))
    })

    test("row deletion", async () => {
        viewData = await coreRequest<SerializedViewData>(req.getViewData(connId, view.id))
        const originalRowCount = viewData.rows.length
        const { _id: _id1 } = await coreRequest<{ _id: number }>(req.createRow(connId, view.id, {
            atIndex: 0,
            values: {
                [nameColumn.id]: "first_deleted",
                [ageColumn.id]: "1",
            }
        }))
        const { _id: _id2 } = await coreRequest<{_id: number }>(req.createRow(connId, view.id, {
            atIndex: 1,
            values: {
                [nameColumn.id]: "second_deleted",
                [ageColumn.id]: "2",
            }
        }))
        const { _id: _id3 } = await coreRequest<{_id: number }>(req.createRow(connId, view.id, {
            atIndex: 2,
            values: {
                [nameColumn.id]: "third_deleted",
                [ageColumn.id]: "3",
            }
        }))
        const { rowsDeleted } = await coreRequest<{ rowsDeleted: number }>(
            req.deleteRows(connId, view.id, _id1)
        )
        expect(rowsDeleted).toBe(1)
        viewData = await coreRequest<SerializedViewData>(req.getViewData(connId, view.id))
        // ensure that 1. row is gone 2. indices have been shifted appropriately
        expect(viewData.rows).toEqual(expect.arrayContaining([
            expect.objectContaining({
                index: 0,
                [nameColumn.key]: "second_deleted",
                [ageColumn.key]: "2",
            }),
            expect.objectContaining({
                index: 1,
                [nameColumn.key]: "third_deleted",
                [ageColumn.key]: "3",
            })
        ]))
        const { rowsDeleted: rowsDeleted2 } = await coreRequest<{ rowsDeleted: number }>(
            req.deleteRows(connId, view.id, [_id2, _id3])
        )
        expect(rowsDeleted2).toBe(2)
        viewData = await coreRequest<SerializedViewData>(req.getViewData(connId, view.id))
        expect(viewData.rows.length).toBe(originalRowCount)
    })
})
