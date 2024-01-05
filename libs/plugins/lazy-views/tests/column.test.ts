/**
 * Tests for the most basic view functionality; create, delete, add/remove
 * columns. Joins, filtering, grouping, and sorting are done in different
 * test suites.
 */
import path from "path"
import { Core, EventSystem } from "core"
import { openConnection, insert } from "@intutable/database/dist/requests"
import { ColumnType } from "@intutable/database/dist/types"
import {
    getTableData,
    getColumnsFromTable,
    createColumnInTable,
    removeColumn,
} from "@intutable/project-management/dist/requests"

import { V } from "../src/meta"
import { types as T } from "../src"

import { requests as req } from "../src"
import { tableId, asTable, getId } from "../src"
import { condition as c } from "../src"

import { TEST_TABLE_COLUMNS, setupTestTable, deleteTestTable } from "./setup"

let DB_CONN_ID: string
const TEST_TABLE = "tv_employees_col"
const TEST_TABLE_Q = "p1_tv_employees_col"
const TEST_TABLE_OWNER = 1
const TEST_VIEW = "tv_departments_col"
const TEST_VIEW_COLUMNS = ["name", "department"]
const TEST_ROW_OPTIONS: T.RowOptions = {
    conditions: [],
    groupColumns: [],
    sortColumns: [],
}

let core: Core
let testTable: T.TableDescriptor
let testColumnOptions: T.ColumnOptions

beforeAll(async () => {
    core = await Core.create(
        [path.join(__dirname, "../node_modules/@intutable/*"), path.join(__dirname, "..")],
        new EventSystem(false)
    )
    const open = (await core.events.request(openConnection("admin", "admin"))) as {
        connectionId: string
    }
    DB_CONN_ID = open.connectionId
    let { tableId: testTableId_, columns: testTableColumns_ } = await setupTestTable(
        DB_CONN_ID,
        core,
        TEST_TABLE,
        TEST_TABLE_OWNER
    )
    testTable = {
        id: testTableId_,
        key: TEST_TABLE_Q,
        name: TEST_TABLE,
    }
    const testViewBaseColumns = (
        (await core.events.request(getColumnsFromTable(DB_CONN_ID, testTable.id))) as T.PM_Column[]
    ).filter(c => TEST_VIEW_COLUMNS.includes(c.name))
    testColumnOptions = {
        columns: testTableColumns_.filter(c =>
            testViewBaseColumns.some(pmc => pmc.id === c.parentColumnId)
        ),
        joins: [],
    }
    // object data
    await core.events.request(
        insert(DB_CONN_ID, TEST_TABLE_Q, {
            name: "John Doe",
            department: "development",
            salary_month: 4000,
        })
    )
})

afterAll(async () => {
    await deleteTestTable(DB_CONN_ID, core, testTable.id)
    await core.plugins.closeAll()
})

/**
 * Create a view, specifying no columns, and it contains all columns of the
 * underlying table.
 */
describe("can create view with all columns", () => {
    let id: number
    let data: T.ViewData

    beforeAll(async () => {
        id = (
            (await core.events.request(
                req.createView(
                    DB_CONN_ID,
                    tableId(testTable.id),
                    TEST_VIEW,
                    { columns: [], joins: [] },
                    TEST_ROW_OPTIONS
                )
            )) as T.ViewDescriptor
        ).id
        data = (await core.events.request(req.getViewData(DB_CONN_ID, id))) as T.ViewData
    })
    test("data contain all columns of table", () => {
        expect(data.columns).toEqual(
            expect.arrayContaining(
                TEST_TABLE_COLUMNS.map(c =>
                    expect.objectContaining({
                        viewId: id,
                        name: c.name,
                        type: c.type,
                    })
                )
            )
        )
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, id))
    })
})

/** Specify columns explicitly. */
describe("can create view with limited set of columns", () => {
    let id: number
    let data: T.ViewData

    beforeAll(async () => {
        id = (await createColumnTestView()).id
        data = (await core.events.request(req.getViewData(DB_CONN_ID, id))) as T.ViewData
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, id))
    })

    test("view data contain view descriptor", () => {
        expect(data.descriptor).toEqual(
            expect.objectContaining({
                id,
                name: TEST_VIEW,
            })
        )
    })

    test("view data have correct table info", () => {
        expect(data.source).toEqual(
            expect.objectContaining({
                table: testTable,
            })
        )
    })

    test("column info contain correct columns", () => {
        expect(data.columns).toEqual(
            expect.arrayContaining(testColumnOptions.columns.map(c => expect.objectContaining(c)))
        )
        data.columns.map(c => expect(c).toHaveProperty("type"))
    })

    test("row data have specified columns", () => {
        data.columns.map(c => expect(data.rows[0]).toHaveProperty([c.key]))
    })
})

/** Delete a view, and it is no longer present after. */
describe("can delete a view", () => {
    let id: number

    beforeAll(async () => {
        id = (await createColumnTestView()).id
        await core.events.request(req.deleteView(DB_CONN_ID, id))
    })

    test("view no longer present", async () => {
        expect.assertions(1)
        return expect(core.events.request(req.getViewInfo(DB_CONN_ID, id))).rejects.toBeTruthy()
    })
})

describe("can list views", () => {
    let viewId: number

    beforeAll(async () => {
        const response = await createColumnTestView()
        viewId = response.id
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })
    test("can get list of views", async () => {
        let viewList: string[] = (await core.events.request(
            req.listViews(DB_CONN_ID, tableId(testTable.id))
        )) as string[]
        expect(viewList.length).toBe(1)
        expect(viewList[0]).toEqual(
            expect.objectContaining({
                id: viewId,
                name: TEST_VIEW,
            })
        )
    })
    test("view list is empty after deleting view", async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
        let viewList: string[] = (await core.events.request(
            req.listViews(DB_CONN_ID, tableId(testTable.id))
        )) as string[]
        expect(viewList.length).toBe(0)
    })
})

/**
 * Get the [`ViewOptions`{@link ../src/types/ViewOptions} of the view.
 * They should match the specifications given on creating the view.
 */
describe("retrieve options of a view", () => {
    let viewId: number

    beforeAll(async () => {
        const response = await createColumnTestView()
        viewId = response.id
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })
    test("props obtained are the same as options inserted", async () => {
        let props = (await core.events.request(
            req.getViewOptions(DB_CONN_ID, viewId)
        )) as T.ViewOptions
        expect(props.name).toBe(TEST_VIEW)
        expect(getId(props.source)).toBe(testTable.id)
        expect(props.userId).toBe(null)
        expect(props.columnOptions).toEqual(expect.objectContaining(testColumnOptions))
        expect(props.rowOptions).toEqual(expect.objectContaining(TEST_ROW_OPTIONS))
    })
})

/**
 * Get [`ViewInfo`]{@link ../src/types/ViewInfo}, i.e. the full metadata, of
 * the view.
 */
describe("can get metadata from a view without rows", () => {
    let viewId: number
    let info: T.ViewInfo
    beforeAll(async () => {
        let response = (await createColumnTestView()) as any
        viewId = response.id
        info = (await core.events.request(req.getViewInfo(DB_CONN_ID, viewId))) as T.ViewInfo
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })
    test("data contain descriptor of view", () => {
        expect(info.descriptor).toEqual(
            expect.objectContaining({
                id: viewId,
                name: TEST_VIEW,
            })
        )
    })
    test("data contain a list of joins (empty)", () => {
        expect(info.joins).toEqual([])
    })
    test("data contain only columns of the view", async () => {
        containsOnlyColumnNames(TEST_VIEW_COLUMNS, info.columns)
    })
})

/**
 * Manipulate custom metadata of columns. (can specify these oneself).
 */
describe("get custom column props", () => {
    // assign custom name to each.
    const CUSTOM_PROP = "display_name"
    let customColumnOptions: T.ColumnOptions
    let viewId: number
    let info: T.ViewInfo
    beforeAll(async () => {
        await core.events.request(
            req.addColumnAttribute(DB_CONN_ID, {
                name: CUSTOM_PROP,
                type: ColumnType.string,
                options: [],
            })
        )
        customColumnOptions = {
            ...testColumnOptions,
            columns: testColumnOptions.columns.map((c, idx) => ({
                ...c,
                attributes: { [CUSTOM_PROP]: "Column No. " + idx.toString() },
            })),
        }
        viewId = (
            (await core.events.request(
                req.createView(
                    DB_CONN_ID,
                    tableId(testTable.id),
                    TEST_VIEW,
                    customColumnOptions,
                    TEST_ROW_OPTIONS
                )
            )) as any
        ).id
    })
    test("getViewInfo delivers columns with custom prop", async () => {
        info = (await core.events.request(req.getViewInfo(DB_CONN_ID, viewId))) as T.ViewInfo
        expect(info.columns).toEqual(
            expect.arrayContaining(customColumnOptions.columns.map(c => expect.objectContaining(c)))
        )
    })
    test("can change attributes", async () => {
        let newName = "Column No. 7"
        const newColumn = (await core.events.request(
            req.changeColumnAttributes(DB_CONN_ID, info.columns[1]!.id, {
                [CUSTOM_PROP]: newName,
            })
        )) as T.ColumnInfo
        info = (await core.events.request(req.getViewInfo(DB_CONN_ID, viewId))) as T.ViewInfo
        expect(info.columns).toEqual(expect.arrayContaining([newColumn]))
    })
    test("cannot change default attributes", async () => {
        const promise = core.events.request(
            req.changeColumnAttributes(DB_CONN_ID, info.columns[1]!.id, {
                [V.ID]: 1000000,
            })
        )
        expect(promise).rejects.toBeTruthy()
    })

    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
        await core.events.request(req.removeColumnAttribute(DB_CONN_ID, CUSTOM_PROP))
    })
})

/**
 * Get a view's [`ViewData`]{@link ../src/types/ViewData}, which contain all
 * metadata as well as the object data.
 */
describe("get data from a view", () => {
    let viewId: number
    let data: T.ViewData

    beforeAll(async () => {
        let response = (await createColumnTestView()) as any
        viewId = response.id
        data = (await core.events.request(req.getViewData(DB_CONN_ID, viewId))) as T.ViewData
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })
    test("data contain only columns of the view", async () => {
        containsOnlyColumnNames(TEST_VIEW_COLUMNS, <T.ColumnInfo[]>data.columns)
    })
    test("data contain exactly the row(s) present in the table", async () => {
        expect(data.rows.length).toBe(1)
        expect(Object.values(data.rows[0])).toEqual(
            expect.arrayContaining(["John Doe", "development"])
        )
        expect(Object.keys(data.rows[0])).not.toEqual(
            expect.arrayContaining([expect.stringContaining("salary_month")])
        )
    })
    test("get keys of underlying table and columns", async () => {
        expect(asTable(data.source).table.key).toBe(testTable.key)
    })
})

describe("can rename a view", () => {
    const newViewName = "tv_abteilungen"
    let id: number

    beforeAll(async () => {
        id = (await createColumnTestView()).id
        await core.events.request(req.renameView(DB_CONN_ID, id, newViewName))
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, id))
    })
    test("view has new name and key", async () => {
        const options = (await core.events.request(
            req.getViewOptions(DB_CONN_ID, id)
        )) as T.ViewOptions
        expect(options.name).toBe(newViewName)
    })
})

describe("can add columns to views", () => {
    let id: number
    let newColumn = "salary_month"
    let columnId: number
    let newColumns = TEST_VIEW_COLUMNS.concat(newColumn)
    let column: T.ColumnInfo
    let data: T.ViewData

    beforeAll(async () => {
        id = (await createColumnTestView()).id
        let columns = (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, testTable.id)
        )) as T.PM_Column[]
        columnId = columns.filter(c => c.name === newColumn).map(c => c.id)[0]
        column = (await core.events.request(
            req.addColumnToView(DB_CONN_ID, id, {
                parentColumnId: columnId,
                attributes: {},
            })
        )) as T.ColumnInfo
        data = (await core.events.request(req.getViewData(DB_CONN_ID, id))) as T.ViewData
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, id))
    })
    test("addColumnToView returns t.ColumnDescriptor", () => {
        expect(column).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                parentColumnId: columnId,
                key: expect.any(String),
                joinId: null,
            })
        )
    })
    test("new view has added SQL column", async () => {
        expect(data.rows).toEqual(
            expect.arrayContaining([expect.objectContaining({ [column.key]: expect.anything() })])
        )
    })
    test("new view has added meta column", async () => {
        expect(data.columns).toEqual(expect.arrayContaining([expect.objectContaining(column)]))
        containsOnlyColumnNames(newColumns, data.columns)
    })
    test("cannot add column that does not exist in table", async () => {
        let addPromise = core.events.request(
            req.addColumnToView(DB_CONN_ID, id, {
                parentColumnId: -1,
                attributes: {},
            })
        )
        expect(addPromise).rejects.toHaveProperty("message")
    })
})

describe("can remove columns from views", () => {
    let id: number
    let columnToGo: string = "department"
    let column: T.ColumnInfo
    let newColumns = TEST_VIEW_COLUMNS.filter(x => x !== columnToGo)
    let data: T.ViewData

    beforeAll(async () => {
        id = (await createColumnTestView()).id
        let info = (await core.events.request(req.getViewInfo(DB_CONN_ID, id))) as T.ViewInfo
        column = info.columns.find(c => c.key.endsWith(columnToGo))!
        expect(column).toBeTruthy()
        await core.events.request(req.removeColumnFromView(DB_CONN_ID, column.id))
        data = (await core.events.request(req.getViewData(DB_CONN_ID, id))) as T.ViewData
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, id))
    })
    test("new view no longer has removed meta column", async () => {
        expect(data.columns).not.toEqual(expect.arrayContaining([expect.objectContaining(column)]))
        let info = (await core.events.request(req.getViewInfo(DB_CONN_ID, id))) as T.ViewInfo
        containsOnlyColumnNames(newColumns, info.columns)
    })
    test("view rows no longer contain removed column", async () => {
        expect(data.rows).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [column.key]: expect.anything(),
                }),
            ])
        )
    })
})

/**
 * The original implementation used plain Knex.raw(...), which was vulnerable
 * to SQL injections. This tests that the current implementation is not.
 */
describe("protected against SQL injections", () => {
    let viewId: number

    beforeAll(async () => {
        viewId = (await createColumnTestView()).id
    })
    afterAll(async () => await core.events.request(req.deleteView(DB_CONN_ID, viewId)))

    test("injection attempt fails due to bindings", async () => {
        const info = (await core.events.request(req.getViewInfo(DB_CONN_ID, viewId))) as T.ViewInfo
        const nameColumn = info.columns.find(c => c.name === "name")!
        // tested this out one with the old string setup and it worked.
        let maliciousOptions = {
            conditions: [c.where(nameColumn, "=", `'; DELETE FROM ${testTable.key}; --`)],
            groupColumns: [],
            sortColumns: [],
        }

        let tableData = await core.events.request(getTableData(DB_CONN_ID, testTable.id))
        const numRows = tableData.rows.length

        await core.events.request(req.changeRowOptions(DB_CONN_ID, viewId, maliciousOptions))
        // the above line just stores the malicious string in the database,
        // this is where the injection hole actually is (was).
        await core.events.request(req.getViewData(DB_CONN_ID, viewId)).catch(e => {
            console.log(JSON.stringify(e))
        })

        tableData = await core.events.request(getTableData(DB_CONN_ID, testTable.id))
        expect(tableData.rows.length).toBe(numRows)
    })
})

describe("columns with unusual names AND outputFunc work", () => {
    const specialColumns = [
        { name: "special#char", id: -1 },
        { name: "UPPERCASE", id: -1 },
        { name: "nön-ãscii", id: -1 },
    ]

    let viewId: number

    beforeAll(async () => {
        viewId = await createColumnTestView().then(desc => desc.id)
        for (let column of specialColumns) {
            column.id = await core.events
                .request(createColumnInTable(DB_CONN_ID, testTable.id, column.name))
                .then(column => column.id)
            await core.events.request(
                req.addColumnToView(DB_CONN_ID, viewId, {
                    parentColumnId: column.id,
                    attributes: {},
                    outputFunc: "??", // trivial output function, leaves everything as is
                })
            )
        }
    })

    afterAll(async () => {
        for (let column of specialColumns)
            await core.events.request(removeColumn(DB_CONN_ID, column.id))
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })

    test("get view data without crashing", async () => {
        const viewPromise = core.events.request(req.getViewData(DB_CONN_ID, viewId))
        await expect(viewPromise).resolves.toEqual(
            expect.objectContaining({
                descriptor: expect.objectContaining({ id: viewId }),
                columns: expect.arrayContaining(
                    specialColumns.map(column => expect.objectContaining({ name: column.name }))
                ),
            })
        )
    })
})

// utils
async function createColumnTestView(): Promise<T.ViewDescriptor> {
    return core.events.request(
        req.createView(
            DB_CONN_ID,
            tableId(testTable.id),
            TEST_VIEW,
            testColumnOptions,
            TEST_ROW_OPTIONS
        )
    )
}

function containsOnlyColumnNames(columnNames: string[], columns: T.ColumnInfo[]) {
    expect(columns).toEqual(
        expect.arrayContaining(
            columnNames.map(n =>
                expect.objectContaining({
                    name: n,
                })
            )
        )
    )
    expect(columns.length).toBe(columnNames.length)
}
