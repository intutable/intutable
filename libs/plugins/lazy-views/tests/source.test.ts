/**
 * Originally, we had a kind of view that is built on a _table_, and joins to
 * 0 to n other _views_. You could join to a table by just creating a trivial
 * view on top of it, so we started out like that. But when the need for
 * views on views came up, we had to make it more flexible. This test suite
 * ensures that views work regardless of what kind of selectable (or
 * data source, as we will be calling it much of the time) they are based on.
 */

import path from "path"
import { Core, EventSystem } from "core"
import { Column, ColumnType, SimpleColumnOption } from "@intutable/database/dist/types"
import { insert, openConnection, closeConnection, update } from "@intutable/database/dist/requests"
import { TableInfo } from "@intutable/project-management/dist/types"
import {
    createProject,
    createTableInProject,
    createColumnInTable,
    getColumnsFromTable,
    removeProject,
    removeTable,
    getTableInfo,
} from "@intutable/project-management/dist/requests"

import { V } from "../src/meta"
import { types as T } from "../src"
import { requests as req } from "../src"
import { SelectableSpecifier, tableId, viewId, isTable, getId } from "../src"

let DB_CONN_ID: string
const USER_ID = 1
const PROJECT_NAME = "sourceTestProject"

// "Base" view is the one that will be used as the source for other views.
const BASE_TABLE_NAME = "employees"
const BASE_TABLE_COLUMNS: Column[] = [
    {
        name: "first_name",
        type: ColumnType.string,
        options: [SimpleColumnOption.notNullable],
    },
    {
        name: "last_name",
        type: ColumnType.string,
        options: [SimpleColumnOption.notNullable],
    },
]

const JOIN_TABLE_NAME = "departments"
const JOIN_TABLE_COLUMNS: Column[] = [
    {
        name: "name",
        type: ColumnType.string,
        options: [SimpleColumnOption.notNullable],
    },
    {
        name: "head",
        type: ColumnType.string,
        options: [SimpleColumnOption.notNullable],
    },
]
const BASE_VIEW_NAME = "employeesPlus"
const JOIN_VIEW_NAME = "departments"
const FK_COLUMN = "department" // in employees, points to departments
const FOREIGN_COLUMN = "head" // column of departments to show in view

/** "top" means view-on-view in this case. */
const TOP_VIEW_NAME = "employeesDoublePlus"

// holds all the entities' IDs that are only found out at runtime
const S = {
    projectId: -1,
    baseTable: {
        id: -1,
        key: "",
        name: "",
    } as T.TableDescriptor,
    baseTableColumns: [] as T.ColumnSpecifier[],
    baseView: {
        id: -1,
        name: "",
    } as T.ViewDescriptor,
    joinTable: {
        id: -1,
        key: "",
        name: "",
    },
    joinTableColumns: [] as T.ColumnSpecifier[],
    joinView: {
        id: -1,
        name: "",
    } as T.ViewDescriptor,
    joinViewColumns: [] as T.ColumnInfo[],
    join: {
        id: -1,
        foreignSource: { type: 0, id: -1 } as SelectableSpecifier,
        on: [-1, "", -1],
    },
    fkColumnId: -1, // foreign key in employees _table_
    pkColumnId: -1, // column of departments table to which FK points
    foreignColumnId: -1, // column of departments to show in employees view
    topView: {
        id: -1,
        name: "",
    } as T.ViewDescriptor,
    topFkColumnId: -1, // also want to test joins from higher-order views
}

let core: Core

beforeAll(async () => {
    core = await Core.create(
        [path.join(__dirname, "../node_modules/@intutable/*"), path.join(__dirname, "..")],
        new EventSystem(false)
    )
    const open = (await core.events.request(openConnection("admin", "admin"))) as {
        connectionId: string
    }
    DB_CONN_ID = open.connectionId
})

afterAll(async () => {
    await core.events.request(closeConnection(DB_CONN_ID))
    await core.plugins.closeAll()
})

/** Basic: create a view that selects from another view. In general, we
 * distinguish "base table", "base view", and "top view" (the higher-order
 * one). In particular
 */
describe("can create a view whose source is another view", () => {
    let baseView: T.ViewInfo
    let foreignColumn: T.ColumnInfo
    let topViewData: T.ViewData

    beforeAll(async () => {
        await setupSourceTest()
        await createTopView(false)
        baseView = (await core.events.request(
            req.getViewInfo(DB_CONN_ID, S.baseView.id)
        )) as T.ViewInfo
        foreignColumn = baseView.columns.find(c => c.joinId !== null)!
        topViewData = (await core.events.request(
            req.getViewData(DB_CONN_ID, S.topView.id)
        )) as T.ViewData
    })
    afterAll(async () => {
        await deleteTopView()
        await teardownSourceTest()
    })

    test("top view's columns contain the foreign column", async () => {
        expect(topViewData.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    parentColumnId: foreignColumn.id,
                }),
            ])
        )
    })
})

/**
 * Adding a join to the top view. These are pretty much orthogonal issues,
 * so something would have to go very wrong for this not to work out. Or so
 * you'd think - since all selectables and columns have to be aliased, there
 * is reason to fear that combining these two functionalities might cause
 * problems.
 */
describe("can join from a view whose source is another view", () => {
    let baseView: T.ViewInfo
    let firstNameColumn: T.ColumnInfo
    let topViewData: T.ViewData
    let topFkColumn: T.ColumnInfo

    beforeAll(async () => {
        await setupSourceTest()
        await createTopView(true)

        baseView = (await core.events.request(
            req.getViewInfo(DB_CONN_ID, S.baseView.id)
        )) as T.ViewInfo
        firstNameColumn = baseView.columns.find(c => c.name === "first_name")!
        topFkColumn = (await core.events.request(
            req.getColumnInfo(DB_CONN_ID, S.topFkColumnId)
        )) as T.ColumnInfo

        // think of it as "colleague", each employee's points to the other.
        await core.events.request(
            update(DB_CONN_ID, S.baseTable.key, {
                condition: ["first_name", "John"],
                update: { [topFkColumn.name]: 2 },
            })
        )
        await core.events.request(
            update(DB_CONN_ID, S.baseTable.key, {
                condition: ["first_name", "Jane"],
                update: { [topFkColumn.name]: 1 },
            })
        )
        const pkColumnId = baseView.columns.find(c => c.name === V.ID)!.id
        await core.events.request(
            req.addJoinToView(DB_CONN_ID, S.topView.id, {
                foreignSource: viewId(S.baseView.id),
                on: [topFkColumn.id, "=", pkColumnId],
                columns: [{ parentColumnId: firstNameColumn.id, attributes: {} }],
            })
        )
        topViewData = (await core.events.request(
            req.getViewData(DB_CONN_ID, S.topView.id)
        )) as T.ViewData
    })
    afterAll(async () => {
        await deleteTopView()
        await teardownSourceTest()
    })
    test("metadata contain foreign column", async () => {
        const foreignColumn = topViewData.columns.find(
            c => c.name === "first_name" && c.joinId !== null
        )!
        expect(foreignColumn).toBeTruthy()
    })
    test("rows contain correct matching", async () => {
        const firstNameTopColumn = topViewData.columns.find(
            c => c.parentColumnId === firstNameColumn.id
        )!
        const foreignColumn = topViewData.columns.find(
            c => c.name === "first_name" && c.joinId !== null
        )!
        expect(topViewData.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [firstNameTopColumn.key]: "John",
                    [foreignColumn.key]: "Jane",
                }),
                expect.objectContaining({
                    [firstNameTopColumn.key]: "Jane",
                    [foreignColumn.key]: "John",
                }),
            ])
        )
    })
})

/**
 * Originally, you could only join to another view, not a table. This tests
 * that the different implementation works too.
 */
describe("can add join with a table as foreign source", () => {
    let fkColumn: T.ColumnInfo

    let foreignTable: TableInfo
    let foreignColumn: T.PM_Column

    let topView: T.ViewDescriptor
    let topViewData: T.ViewData

    beforeAll(async () => {
        await setupSourceTest()
        await createTopView(true)
        fkColumn = (await core.events.request(
            req.getColumnInfo(DB_CONN_ID, S.topFkColumnId)
        )) as T.ColumnInfo

        foreignTable = (await core.events.request(
            getTableInfo(DB_CONN_ID, S.baseTable.id)
        )) as TableInfo
        const pkColumn = foreignTable.columns.find(c => c.name === "_id")!
        foreignColumn = foreignTable.columns.find(c => c.name === "first_name")!

        topView = (await core.events.request(
            req.createView(
                DB_CONN_ID,
                viewId(S.baseView.id),
                "Located Employees",
                {
                    columns: [],
                    joins: [
                        {
                            foreignSource: tableId(foreignTable.table.id),
                            on: [fkColumn.id, "=", pkColumn.id],
                            columns: [
                                {
                                    parentColumnId: foreignColumn.id,
                                    attributes: {},
                                },
                            ],
                        },
                    ],
                },
                { conditions: [], sortColumns: [], groupColumns: [] },
                USER_ID
            )
        )) as T.ViewDescriptor

        // add some data
        await core.events.request(
            update(DB_CONN_ID, S.baseTable.key, {
                condition: ["first_name", "John"],
                update: { [fkColumn.name]: 2 },
            })
        )
        await core.events.request(
            update(DB_CONN_ID, S.baseTable.key, {
                condition: ["first_name", "Jane"],
                update: { [fkColumn.name]: 1 },
            })
        )

        topViewData = await core.events.request(req.getViewData(DB_CONN_ID, topView.id))
    })
    afterAll(async () => {
        await deleteTopView()
        await teardownSourceTest()
    })

    test("view metadata contain reference to foreign table", async () => {
        const foreignSource = topViewData.joins[0]!.foreignSource
        expect(isTable(foreignSource)).toBeTruthy()
        expect(getId(foreignSource)).toEqual(foreignTable.table.id)
    })

    test("view metadata contain column of foreign table", async () => {
        expect(topViewData.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    parentColumnId: foreignColumn.id,
                    name: foreignColumn.name,
                }),
            ])
        )
    })

    test("view rows are linked appropriately", async () => {
        const firstNameTopColumn = topViewData.columns.find(
            c => c.name === "first_name" && c.joinId === null
        )!
        const firstNameForeignColumn = topViewData.columns.find(
            c => c.parentColumnId === foreignColumn.id
        )!
        expect(topViewData.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [firstNameTopColumn.key]: "John",
                    [firstNameForeignColumn.key]: "Jane",
                }),
                expect.objectContaining({
                    [firstNameTopColumn.key]: "Jane",
                    [firstNameForeignColumn.key]: "John",
                }),
            ])
        )
    })
})

/**
 * Test that bug where getColumnInfo does not work on foreign columns, i.e.
 * columns whose parent column is from a different source, is fixed.
 */
describe("getColumnInfo works on foreign columns as well", () => {
    /**
     * If the joining table's source is a table, it may happen that there
     * is coincidentally a table column with the "correct" ID. The
     * most recently created view column's ID will be greater than that of any
     * table column, ensuring that this cannot happen, so we make sure to
     * use it as the base for our
     */
    let lastViewColumn: T.ColumnInfo
    let joiningColumn: T.ColumnInfo

    beforeAll(async () => {
        await setupSourceTest()
        await createTopView(false)
        const topViewInfo = (await core.events.request(
            req.getViewInfo(DB_CONN_ID, S.topView.id)
        )) as T.ViewInfo
        lastViewColumn = topViewInfo.columns.sort((c1, c2) => (c1.id > c2.id ? 1 : -1)).slice(-1)[0]
        const fkColumn = await core.events.request(
            createColumnInTable(DB_CONN_ID, S.joinTable.id, "j3_fk", ColumnType.integer)
        )
        const topPkColumn = topViewInfo.columns.find(c => c.name === V.ID)!
        const join = await core.events.request(
            req.addJoinToView(DB_CONN_ID, S.joinView.id, {
                foreignSource: viewId(S.topView.id),
                on: [fkColumn.id, "=", topPkColumn.id],
                columns: [],
            })
        )
        joiningColumn = await core.events.request(
            req.addColumnToView(
                DB_CONN_ID,
                S.joinView.id,
                { parentColumnId: topPkColumn.id, attributes: {} },
                join.id
            )
        )
    })
    afterAll(async () => {
        await teardownSourceTest()
    })
    test("target column's ID is greater than any table column's", async () => {
        const joinTableInfo = (await core.events.request(
            getTableInfo(DB_CONN_ID, S.joinTable.id)
        )) as TableInfo
        const lastTableColumn = joinTableInfo.columns
            .sort((c1, c2) => (c1.id > c2.id ? 1 : -1))
            .slice(-1)[0]

        expect(lastViewColumn.id).toBeGreaterThan(lastTableColumn.id)
    })
    test("can get column info of joining column", async () => {
        const info = (await core.events.request(
            req.getColumnInfo(DB_CONN_ID, joiningColumn.id)
        )) as T.ColumnInfo
        expect(info.name).toBe("_id")
    })
})

describe("fail early and loudly if given bad source", () => {
    const badTableViewName = "bad_table_view"
    const badViewViewName = "bad_view_view"

    beforeAll(async () => {
        await setupSourceTest()
    })
    afterAll(async () => {
        await teardownSourceTest()
    })
    test("cannot create a view over a nonexistent table", async () => {
        const promise = core.events.request(
            req.createView(
                DB_CONN_ID,
                tableId(-1),
                badTableViewName,
                { columns: [], joins: [] },
                { conditions: [], groupColumns: [], sortColumns: [] }
            )
        )
        await expect(promise).rejects.toEqual(
            expect.objectContaining({
                message: expect.stringContaining("could not create view"),
                cause: expect.objectContaining({
                    message: expect.stringContaining("-1"),
                }),
            })
        )
    })
    test("cannot create a view over a nonexistent view", async () => {
        const promise = core.events.request(
            req.createView(
                DB_CONN_ID,
                viewId(-1),
                badViewViewName,
                { columns: [], joins: [] },
                { conditions: [], groupColumns: [], sortColumns: [] }
            )
        )
        await expect(promise).rejects.toEqual(
            expect.objectContaining({
                message: expect.stringContaining("could not create view"),
                cause: expect.objectContaining({
                    message: expect.stringContaining("-1"),
                }),
            })
        )
    })
    test("cannot join to a nonexistent table", async () => {
        const promise = core.events.request(
            req.createView(
                DB_CONN_ID,
                tableId(S.baseTable.id),
                badTableViewName,
                {
                    columns: [],
                    joins: [
                        {
                            foreignSource: tableId(-1),
                            columns: [],
                            on: [-1, "=", -1],
                        },
                    ],
                },
                { conditions: [], groupColumns: [], sortColumns: [] }
            )
        )
        // here there's an extra level, because the join also has a catch block.
        await expect(promise).rejects.toEqual(
            expect.objectContaining({
                message: expect.stringContaining("could not create view"),
                cause: expect.objectContaining({
                    message: expect.stringContaining("join"),
                    cause: expect.objectContaining({
                        message: expect.stringContaining("-1"),
                    }),
                }),
            })
        )
    })
    test("cannot add a nonexistent column to a view", async () => {
        const promise = core.events.request(
            req.addColumnToView(DB_CONN_ID, S.baseView.id, {
                parentColumnId: -1,
                attributes: {},
            })
        )
        await expect(promise).rejects.toEqual(
            expect.objectContaining({
                message: expect.stringContaining("could not add column"),
                cause: expect.objectContaining({
                    message: expect.stringContaining("-1"),
                }),
            })
        )
    })
})

// =============================================================================
// SETUP
async function setupSourceTest() {
    await setupSourceTestMetadata()
    await populateSourceTestTables()
}

async function setupSourceTestMetadata() {
    S.projectId = (
        (await core.events.request(createProject(DB_CONN_ID, USER_ID, PROJECT_NAME))) as {
            id: number
        }
    ).id
    S.baseTable = (await core.events.request(
        createTableInProject(DB_CONN_ID, USER_ID, S.projectId, BASE_TABLE_NAME, BASE_TABLE_COLUMNS)
    )) as T.TableDescriptor
    S.baseTableColumns = (
        (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, S.baseTable.id)
        )) as T.PM_Column[]
    ).map(col => ({ parentColumnId: col.id, attributes: {} }))

    S.joinTable = (await core.events.request(
        createTableInProject(DB_CONN_ID, USER_ID, S.projectId, JOIN_TABLE_NAME, JOIN_TABLE_COLUMNS)
    )) as T.TableDescriptor
    // need to pair these with keys for now, so we can find specific ones below.
    S.joinTableColumns = (
        (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, S.joinTable.id)
        )) as T.PM_Column[]
    ).map(col => ({ parentColumnId: col.id, attributes: {} }))
    S.joinView = (await core.events.request(
        req.createView(
            DB_CONN_ID,
            tableId(S.joinTable.id),
            JOIN_VIEW_NAME,
            { columns: S.joinTableColumns, joins: [] },
            { conditions: [], sortColumns: [], groupColumns: [] }
        )
    )) as T.ViewDescriptor
    S.joinViewColumns = (
        (await core.events.request(req.getViewInfo(DB_CONN_ID, S.joinView.id))) as T.ViewInfo
    ).columns

    S.fkColumnId = (
        (await core.events.request(
            createColumnInTable(DB_CONN_ID, S.baseTable.id, FK_COLUMN, ColumnType.integer)
        )) as T.PM_Column
    ).id
    S.pkColumnId = S.joinViewColumns.find(c => c.name === V.ID)!.id
    // here is where we need the view columns' names.
    S.foreignColumnId = S.joinViewColumns.find(c => c.name === FOREIGN_COLUMN)!.id
    await createBaseView(true)
}
async function populateSourceTestTables() {
    await core.events.request(
        insert(DB_CONN_ID, S.baseTable.key, {
            first_name: "John",
            last_name: "Doe",
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, S.baseTable.key, {
            first_name: "Jane",
            last_name: "Stag",
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, S.joinTable.key, {
            name: "development",
            head: "Dev Department Boss",
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, S.joinTable.key, {
            name: "testing",
            head: "Testing Department Boss",
        })
    )
    await core.events.request(
        update(DB_CONN_ID, S.baseTable.key, {
            condition: ["first_name", "John"],
            update: { [FK_COLUMN]: 1 },
        })
    )
    await core.events.request(
        update(DB_CONN_ID, S.baseTable.key, {
            condition: ["first_name", "Jane"],
            update: { [FK_COLUMN]: 2 },
        })
    )
}
async function teardownSourceTest() {
    await deleteBaseView()
    await core.events.request(removeTable(DB_CONN_ID, S.baseTable.id))
    await core.events.request(req.deleteView(DB_CONN_ID, S.joinView.id))
    await core.events.request(removeTable(DB_CONN_ID, S.joinTable.id))
    await core.events.request(removeProject(DB_CONN_ID, S.projectId))
    S.baseView = { id: -1, name: "" }
    S.baseTableColumns = []
    S.baseTable = { id: -1, name: "", key: "" }
    S.joinViewColumns = []
    S.joinView = { id: -1, name: "" }
    S.joinTableColumns = []
    S.joinTable = { id: -1, name: "", key: "" }
    S.projectId = -1
    S.join = {
        id: -1,
        foreignSource: { type: 0, id: -1 } as SelectableSpecifier,
        on: [-1, "", -1],
    }
    S.fkColumnId = -1
    S.pkColumnId = -1
    S.foreignColumnId = -1
    S.topFkColumnId = -1
}

async function createBaseView(withJoin: boolean = false) {
    const joins: T.JoinSpecifier[] = withJoin
        ? [
              {
                  foreignSource: viewId(S.joinView.id),
                  on: [S.fkColumnId, "=", S.pkColumnId],
                  columns: [{ parentColumnId: S.foreignColumnId, attributes: {} }],
              },
          ]
        : []
    S.baseView = (await core.events.request(
        req.createView(
            DB_CONN_ID,
            tableId(S.baseTable.id),
            BASE_VIEW_NAME,
            { columns: S.baseTableColumns, joins },
            { conditions: [], sortColumns: [], groupColumns: [] }
        )
    )) as T.ViewDescriptor
    const info = (await core.events.request(
        req.getViewInfo(DB_CONN_ID, S.baseView.id)
    )) as T.ViewInfo
    S.join = info.joins[0]
}
async function deleteBaseView() {
    return core.events.request(req.deleteView(DB_CONN_ID, S.baseView.id, true))
}

// build a view on top of J.baseView
async function createTopView(withFk: boolean = false) {
    S.topView = await core.events.request(
        req.createView(
            DB_CONN_ID,
            viewId(S.baseView.id),
            TOP_VIEW_NAME,
            { columns: [], joins: [] },
            { conditions: [], groupColumns: [], sortColumns: [] },
            USER_ID
        )
    )
    // add an extra number column that can be used as a foreign key
    if (withFk) {
        const fkColumnBase = await core.events.request(
            createColumnInTable(DB_CONN_ID, S.baseTable.id, "fk#1", ColumnType.integer)
        )
        S.topFkColumnId = await core.events
            .request(
                req.addColumnToView(DB_CONN_ID, S.baseView.id, {
                    parentColumnId: fkColumnBase.id,
                    attributes: {},
                })
            )
            .then(info => info.id)
    }
}
async function deleteTopView() {
    await core.events.request(req.deleteView(DB_CONN_ID, S.topView.id))
}
