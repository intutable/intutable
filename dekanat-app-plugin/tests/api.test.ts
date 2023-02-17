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
        const rawData = await coreRequest<lvt.ViewInfo>(
            lvr.getViewInfo(connId, TABLE.id)
        )
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
        const views = await coreRequest<lvt.ViewDescriptor[]>(req.listViews(connId, TABLE.id))
        expect(views.length).toBe(1)
        const view = await coreRequest<SerializedViewData>(req.getViewData(connId, views[0].id))
        expect(view.descriptor.name).toBe("Standard")
        expect(view.columns).toEqual(
            expect.arrayContaining([ expect.objectContaining({ name: "Name" }) ])
        )
    })
    test("delete table", async () => {
        const otherTableName = "departments"
        const otherTable: TableDescriptor = await core.events.request(
            req.createTable(connId, ADMIN_ID, PROJECT_ID, otherTableName)
        )
        await core.events.request(req.deleteTable(connId, otherTable.id))
        const tables: PmTable[] = await core.events.request(pm.getTablesFromProject(connId, PROJECT_ID))
        expect(tables).not.toEqual(expect.arrayContaining([
            expect.objectContaining({ name: otherTableName })
        ]))
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
        const views = await coreRequest<ViewDescriptor[]>(req.listViews(connId, TABLE.id))
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
            { name: "Department", cellType: "string" },
            { name: "Salary", cellType: "number" },
        ],
    }
    let TEST_TABLE: TableDescriptor

    beforeAll(async () => {
        TEST_TABLE = await core.events.request(
            req.createTable(connId, ADMIN_ID, PROJECT_ID, TABLE_SPEC.name)
        )
    })

    afterAll(async () => {
        await coreRequest(req.deleteTable(connId, TEST_TABLE.id))
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
        const testTableData = await coreRequest<SerializedViewData>(
            req.getTableData(connId, TEST_TABLE.id)
        )
        const childColumn = testTableData.columns.find(c => c.name === column.name)
        expect(childColumn).toBeDefined()
    })
})

describe("rename columns", () => {
    const TABLE_SPEC = {
        name: "employees",
        columns: {
            department: {
                specifier: { name: "Department", cellType: "string" },
                id: -1
            },
            salary: {
                specifier:
                { name: "Salary", cellType: "number" },
                id: -1
            },
        },
    }
    let testTable: TableDescriptor
    let testTableData: TableData

    beforeAll(async () => {
        testTable = await coreRequest<TableDescriptor>(
            req.createTable(connId, ADMIN_ID, PROJECT_ID, TABLE_SPEC.name)
        )
        TABLE_SPEC.columns.department.id = await coreRequest<SerializedColumn>(
            req.createStandardColumn(connId, testTable.id, TABLE_SPEC.columns.department.specifier)
        ).then(column => column.id)
        TABLE_SPEC.columns.salary.id = await coreRequest<SerializedColumn>(
            req.createStandardColumn(connId, testTable.id, TABLE_SPEC.columns.salary.specifier)
        ).then(column => column.id)
    })

    afterAll(async () => {
        await coreRequest(req.deleteTable(connId, testTable.id))
    })
    test("valid rename - column also renamed in views", async () => {
        const newName = "Dosh"
        await coreRequest(
            req.renameTableColumn(connId, testTable.id, TABLE_SPEC.columns.salary.id, newName)
        )
        testTableData = await coreRequest<TableData>(
            req.getTableData(connId, testTable.id)
        )
        expect(testTableData.columns).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: TABLE_SPEC.columns.department.id,
                name: TABLE_SPEC.columns.department.specifier.name,
            }),
            expect.objectContaining({
                id: TABLE_SPEC.columns.salary.id,
                name: newName,
            }),
        ]))
    })
    test("invalid rename: name already taken", async () => {
        const newName = "Department"
        const renamePromise = coreRequest(
            req.renameTableColumn(connId, testTable.id, TABLE_SPEC.columns.salary.id, newName)
        )
        expect(renamePromise).rejects.toEqual(expect.objectContaining({
            message: expect.stringContaining("already contains"),
            code: ErrorCode.alreadyTaken,
        }))
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

/**
 * To test link functionality, we create a table "employees" and a table "supervisors", and
 * a link employees -> supervisors. We ensure that the linked data are present in the respective
 * other table. We create a lookup column for both the forward and the backward link.
 */
describe("links between tables", () => {
    const homeTableName = "employees"
    let homeTable: TableDescriptor
    let homeTableData: TableData
    let homeNameColumn: SerializedColumn
    let homeFirstNameColumn: SerializedColumn
    let homeRow1 = { _id: -1, name: "Doe", firstName: "John" }
    let homeRow2 = { _id: -1, name: "Stag", firstName: "Jane" }

    let foreignTableName = "supervisors"
    let foreignTable: TableDescriptor
    let foreignTableData: TableData
    let foreignNameColumn: SerializedColumn
    let foreignLevelColumn: SerializedColumn
    let foreignRow1 = { _id: -1, name: "Bill Lumbergh", authorityLevel: "total" }

    let linkColumn: SerializedColumn
    let lookupColumn: SerializedColumn

    let backwardLinkColumn: SerializedColumn
    let backwardLookupColumn: SerializedColumn

    beforeAll(async () => {
        // set up a table with the default column, an extra column, and two rows
        homeTable = await coreRequest<TableDescriptor>(
            req.createTable(connId, ADMIN_ID, PROJECT_ID, homeTableName)
        )

        homeTableData = await coreRequest<TableData>(req.getTableData(connId, homeTable.id))
        homeNameColumn = homeTableData.columns.find(c => c.name === userPrimaryColumnName())!
        homeFirstNameColumn = await coreRequest<SerializedColumn>(
            req.createStandardColumn(connId, homeTable.id, {
                name: "First Name",
                cellType: "string"
            })
        )

        const { _id: id1 } = await coreRequest<{ _id: number }>(
            req.createRow(connId, homeTable.id, {
                values: {
                    [homeNameColumn.id]: homeRow1.name,
                    [homeFirstNameColumn.id]: homeRow1.firstName,
                }
            })
        )
        homeRow1._id = id1
        const { _id: id2 } = await coreRequest<{ _id: number }>(
            req.createRow(connId, homeTable.id, {
                values: {
                    [homeNameColumn.id]: homeRow2.name,
                    [homeFirstNameColumn.id]: homeRow2.firstName,
                }
            })
        )
        homeRow2._id = id2

        // set up another table with one row
        foreignTable = await coreRequest<TableDescriptor>(
            req.createTable(connId, ADMIN_ID, PROJECT_ID, foreignTableName)
        )
        foreignLevelColumn = await coreRequest<SerializedColumn>(
            req.createStandardColumn(connId, foreignTable.id, {
                name: "Authority Level",
                cellType: "string",
            })
        )

        foreignTableData = await coreRequest<TableData>(
            req.getTableData(connId, foreignTable.id)
        )
        foreignNameColumn = foreignTableData.columns.find(c => c.name === userPrimaryColumnName())!

        const { _id: foreignId1 } = await coreRequest<{ _id: number }>(
            req.createRow(connId, foreignTable.id, {
                values: {
                    [foreignNameColumn.id]: foreignRow1.name,
                    [foreignLevelColumn.id]: foreignRow1.authorityLevel,
                }
            })
        )
        foreignRow1._id = foreignId1

        // finally, the link
        linkColumn = await coreRequest<SerializedColumn>(
            req.createLinkColumn(connId, homeTable.id, { foreignTable: foreignTable.id })
        )

        lookupColumn = await coreRequest<SerializedColumn>(
            req.createLookupColumn(connId, homeTable.id, {
                linkId: linkColumn.linkId,
                foreignColumn: foreignLevelColumn.id,
            })
        )
        foreignTableData = await coreRequest<TableData>(
            req.getTableData(connId, foreignTable.id)
        ).catch(e => { console.dir(e); return Promise.reject(e) })
        backwardLinkColumn = foreignTableData.columns.find(
            c => c.inverseLinkColumnId === linkColumn.id
        )!
        backwardLookupColumn = await coreRequest<SerializedColumn>(
            req.createLookupColumn(connId, foreignTable.id, {
                linkId: backwardLinkColumn.linkId,
                foreignColumn: homeFirstNameColumn.id,
            })
        )
    })

    afterAll(async () => {
        await coreRequest(req.deleteTable(connId, homeTable.id))
        await coreRequest(req.deleteTable(connId, foreignTable.id))
    })

    test("link and lookup columns created", async () => {
        expect(linkColumn).toEqual(expect.objectContaining({
            id: expect.any(Number),
            name: expect.stringContaining(userPrimaryColumnName()),
            kind: "link",
        }))
        expect(lookupColumn).toEqual(expect.objectContaining({
            id: expect.any(Number),
            kind: "lookup",
        }))
        expect(backwardLinkColumn).toEqual(expect.objectContaining({
            id: expect.any(Number),
            name: expect.stringContaining(userPrimaryColumnName()),
            kind: "backwardLink",
        }))
        expect(backwardLookupColumn).toEqual(expect.objectContaining({
            id: expect.any(Number),
            kind: "backwardLookup",
        }))
    })

    test("link rows to each other", async () => {
        await coreRequest(
            req.updateRows(connId, homeTable.id, [homeRow1._id, homeRow2._id], {
                [linkColumn.id]: foreignRow1._id
            })
        )
        homeTableData = await coreRequest<TableData>(
            req.getTableData(connId, homeTable.id)
        )
        expect(homeTableData.rows).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: homeRow1._id,
                [homeNameColumn.key]: homeRow1.name,
                [linkColumn.key]: foreignRow1.name,
                [lookupColumn.key]: foreignRow1.authorityLevel,
            }),
            expect.objectContaining({
                _id: homeRow2._id,
                [homeNameColumn.key]: homeRow2.name,
                [linkColumn.key]: foreignRow1.name,
                [lookupColumn.key]: foreignRow1.authorityLevel,
            }),
        ]))
        foreignTableData = await coreRequest<TableData>(
            req.getTableData(connId, foreignTable.id)
        )
        // The rows from the home table are aggregated.
        expect(foreignTableData.rows).toEqual(expect.arrayContaining([
            expect.objectContaining({
                _id: foreignRow1._id,
                [foreignNameColumn.key]: foreignRow1.name,
                [foreignLevelColumn.key]: foreignRow1.authorityLevel,
                [backwardLinkColumn.key]: expect.objectContaining({
                    format: { cellType: "string" },
                    items: expect.arrayContaining([
                        { value: homeRow1.name, props: { _id: homeRow1._id } },
                        { value: homeRow2.name, props: { _id: homeRow2._id } },
                    ])
                }),
                [backwardLookupColumn.key]: expect.objectContaining({
                    format: { cellType: "string" },
                    items: expect.arrayContaining([
                        { value: homeRow1.firstName, props: { _id: homeRow1._id } },
                        { value: homeRow2.firstName, props: { _id: homeRow2._id } },
                    ]),
                })
            })
        ]))
    })

    test("automatically cleans up all artifacts of forward and backward links", async () => {
        const linkColumn2 = await coreRequest<SerializedColumn>(
            req.createLinkColumn(connId, homeTable.id, { foreignTable: foreignTable.id })
        )
        foreignTableData = await coreRequest<TableData>(
            req.getTableData(connId, foreignTable.id)
        ).catch(e => { console.dir(e); return Promise.reject(e) })
        let backwardLinkColumn2 = foreignTableData.columns.find(
            c => c.id === linkColumn2.inverseLinkColumnId
        )
        expect(backwardLinkColumn2).toBeDefined()
        await coreRequest(req.removeColumnFromTable(connId, homeTable.id, linkColumn2.id))
        foreignTableData = await coreRequest<TableData>(
            req.getTableData(connId, foreignTable.id)
        )        
        backwardLinkColumn2 = foreignTableData.columns.find(
            c => c.id === linkColumn2.inverseLinkColumnId
        )
        expect(backwardLinkColumn2).not.toBeDefined()
    })
})
