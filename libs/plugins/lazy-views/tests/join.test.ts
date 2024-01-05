/**
 * Tests the plugin's options for creating views with joins.
 * The tests revolve around the scenario: We have a table "employees" and a table "departments".
 * We want to add a join from employees to departments ("where does this person work?") and
 * a join from departments to employees ("who leads this department?") and eventually
 * join in a circle to show the employees along with their boss (the head of their department)
 * in one view.
 */
import path from "path"
import { Core, EventSystem } from "core"
import { Column, ColumnType, SimpleColumnOption } from "@intutable/database/dist/types"
import { openConnection, select, insert, update } from "@intutable/database/dist/requests"
import {
    createProject,
    createTableInProject,
    createColumnInTable,
    getColumnsFromTable,
    removeProject,
    removeTable,
} from "@intutable/project-management/dist/requests"

import { V } from "../src/meta"
import { types as T } from "../src"
import { requests as req } from "../src"
import { SelectableSpecifier, tableId, viewId } from "../src"

let DB_CONN_ID: string
const USER_ID = 1
const PROJECT_NAME = "joinTestProject"
const EMPLOYEE_TABLE_NAME = "employees"
const EMPLOYEE_TABLE_COLUMNS: Column[] = [
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
const DEPARTMENTS_TABLE_NAME = "departments"
const DEPARTMENTS_TABLE_COLUMNS: Column[] = [
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
const EMPLOYEE_VIEW_NAME = "employeesPlus"
const DEPARTMENTS_VIEW_NAME = "departments"
const FK_COLUMN = "department" // in employees, points to departments
const FOREIGN_COLUMN = "head" // column of departments to show in view

/**
 * To allow for profuse mutable global state but also keep track of it, we
 * have this neat typed dictionary of all sorts of IDs of entities created
 * at runtime.
 */
const J = {
    projectId: -1,
    employeeTable: {
        id: -1,
        key: "",
        name: "",
    } as T.TableDescriptor,
    employeeTableColumns: [] as T.ColumnSpecifier[],
    employeeView: {
        id: -1,
        name: "",
    } as T.ViewDescriptor,
    departmentsTable: {
        id: -1,
        key: "",
        name: "",
    },
    departmentsTableColumns: [] as T.ColumnSpecifier[],
    departmentsView: {
        id: -1,
        name: "",
    } as T.ViewDescriptor,
    departmentsViewColumns: [] as T.ColumnInfo[],
    join: {
        id: -1,
        foreignSource: {
            type: 0,
            id: -1,
        } as SelectableSpecifier,
        on: [-1, "=", -1],
    } as T.JoinDescriptor,
    fkColumnId: -1, // foreign key in employees table
    pkColumnId: -1, // column of departments view to which FK points
    foreignColumnId: -1, // column of departments view to show in employees view
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
    await core.plugins.closeAll()
})

/**
 * The most basic test of joining. Due to an old implementation,
 * the foreign data source is actually not a table, but another view.
 */
describe("create a view with a join", () => {
    beforeAll(async () => {
        await setupJoinTest()
        J.employeeView = (await core.events.request(
            req.createView(
                DB_CONN_ID,
                tableId(J.employeeTable.id),
                EMPLOYEE_VIEW_NAME,
                {
                    columns: J.employeeTableColumns,
                    joins: [
                        {
                            foreignSource: viewId(J.departmentsView.id),
                            on: [J.fkColumnId, "=", J.pkColumnId],
                            columns: [
                                {
                                    parentColumnId: J.foreignColumnId,
                                    attributes: {},
                                },
                            ],
                        },
                    ],
                },
                { conditions: [], sortColumns: [], groupColumns: [] }
            )
        )) as T.ViewDescriptor
    })
    test("view options contain join", async () => {
        const data = (await core.events.request(
            req.getViewOptions(DB_CONN_ID, J.employeeView.id)
        )) as T.ViewOptions
        expect(data.columnOptions).toEqual(
            expect.objectContaining({
                joins: expect.arrayContaining([
                    {
                        foreignSource: viewId(J.departmentsView.id),
                        on: [J.fkColumnId, "=", J.pkColumnId],
                        columns: [
                            expect.objectContaining({
                                parentColumnId: J.foreignColumnId,
                            }),
                        ],
                        preGroup: false,
                    },
                ]),
            })
        )
    })
    test("view data contain new column", async () => {
        const data = (await core.events.request(
            req.getViewData(DB_CONN_ID, J.employeeView.id)
        )) as T.ViewData
        const fkColumn = data.columns.find(c => c.name === FOREIGN_COLUMN)!
        expect(data.joins).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.anything(),
                    foreignSource: viewId(J.departmentsView.id),
                    on: expect.anything(),
                }),
            ])
        )
        expect(data.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    parentColumnId: expect.anything(),
                    name: FOREIGN_COLUMN,
                    joinId: data.joins[0].id,
                }),
            ])
        )
        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [fkColumn.key]: "Dev Department Boss",
                }),
                expect.objectContaining({
                    [fkColumn.key]: "Testing Department Boss",
                }),
            ])
        )
    })
    afterAll(async () => {
        await deleteJoinTestView()
        await teardownJoinTest()
    })
})

/** Add a join to a view after it's already been created */
describe("add a join to a view", () => {
    beforeAll(async () => {
        await setupJoinTest()
        await createJoinTestView(false)
        J.join = (await core.events.request(
            req.addJoinToView(DB_CONN_ID, J.employeeView.id, {
                foreignSource: viewId(J.departmentsView.id),
                on: [J.fkColumnId, "=", J.pkColumnId],
                columns: [{ parentColumnId: J.foreignColumnId, attributes: {} }],
            })
        )) as T.JoinDescriptor
    })
    test("addJoinToView returns JoinDescriptor", () => {
        expect(J.join).toEqual(
            expect.objectContaining({
                id: expect.anything(),
                foreignSource: viewId(J.departmentsView.id),
                on: [J.fkColumnId, "=", J.pkColumnId],
            })
        )
    })
    test("view options contain new join", async () => {
        let props = (await core.events.request(
            req.getViewOptions(DB_CONN_ID, J.employeeView.id)
        )) as T.ViewOptions
        expect(props.columnOptions.joins).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    foreignSource: viewId(J.departmentsView.id),
                }),
            ])
        )
    })
    test("view data contain new column", async () => {
        const data = (await core.events.request(
            req.getViewData(DB_CONN_ID, J.employeeView.id)
        )) as T.ViewData
        const fkColumn = data.columns.find(c => c.name === FOREIGN_COLUMN)!
        expect(data.joins).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.anything(),
                    foreignSource: viewId(J.departmentsView.id),
                    on: expect.anything(),
                }),
            ])
        )
        expect(data.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    parentColumnId: expect.anything(),
                    name: FOREIGN_COLUMN,
                    joinId: data.joins[0].id,
                }),
            ])
        )
        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [fkColumn.key]: "Dev Department Boss",
                }),
                expect.objectContaining({
                    [fkColumn.key]: "Testing Department Boss",
                }),
            ])
        )
    })
    afterAll(async () => {
        await deleteJoinTestView()
        await teardownJoinTest()
    })
})

describe("prevent adding invalid joins", () => {
    beforeAll(async () => {
        await setupJoinTest()
        await createJoinTestView(false)
    })
    afterAll(async () => {
        await deleteJoinTestView()
        await teardownJoinTest()
    })
    test("bad foreign source", async () => {
        const badJoin: T.JoinSpecifier = {
            foreignSource: tableId(-1),
            on: [J.fkColumnId, "=", J.pkColumnId],
            columns: [],
        }
        const addJoinPromise = core.events.request(
            req.addJoinToView(DB_CONN_ID, J.employeeView.id, badJoin)
        )
        expect(addJoinPromise).rejects.toEqual(
            expect.objectContaining({
                cause: expect.objectContaining({
                    message: expect.stringContaining("-1"),
                }),
            })
        )
    })
    test("condition involves nonexistent columns", async () => {
        const badJoin: T.JoinSpecifier = {
            foreignSource: viewId(J.departmentsView.id),
            on: [J.fkColumnId, "=", -1],
            columns: [],
        }
        const addJoinPromise = core.events.request(
            req.addJoinToView(DB_CONN_ID, J.employeeView.id, badJoin)
        )
        expect(addJoinPromise).rejects.toEqual(
            expect.objectContaining({
                cause: expect.objectContaining({
                    message: expect.stringContaining("right"),
                    cause: expect.objectContaining({
                        message: expect.stringContaining("-1"),
                    }),
                }),
            })
        )
    })
})

describe("delete a column belonging to a join", () => {
    let viewColumnId: number
    beforeAll(async () => {
        await setupJoinTest()
        J.employeeView = (await core.events.request(
            req.createView(
                DB_CONN_ID,
                tableId(J.employeeTable.id),
                EMPLOYEE_VIEW_NAME,
                {
                    columns: J.employeeTableColumns,
                    joins: [
                        {
                            foreignSource: viewId(J.departmentsView.id),
                            on: [J.fkColumnId, "=", J.pkColumnId],
                            columns: [
                                {
                                    parentColumnId: J.foreignColumnId,
                                    attributes: {},
                                },
                            ],
                        },
                    ],
                },
                { conditions: [], sortColumns: [], groupColumns: [] }
            )
        )) as T.ViewDescriptor
        const data = (await core.events.request(
            req.getViewData(DB_CONN_ID, J.employeeView.id)
        )) as {
            columns: T.ColumnInfo[]
        }
        viewColumnId = data.columns.find(c => c.joinId !== null)!.id
    })
    test("column is gone after removeColumn", async () => {
        await core.events.request(req.removeColumnFromView(DB_CONN_ID, viewColumnId))
        const data = (await core.events.request(
            req.getViewData(DB_CONN_ID, J.employeeView.id)
        )) as {
            columns: T.ColumnInfo[]
        }
        expect(data.columns.filter(c => c.joinId !== null).length).toBe(0)
    })
    afterAll(async () => {
        await deleteJoinTestView()
        await teardownJoinTest()
    })
})

describe("delete a view with a join", () => {
    beforeAll(async () => {
        await setupJoinTest()
        J.employeeView = (await core.events.request(
            req.createView(
                DB_CONN_ID,
                tableId(J.employeeTable.id),
                EMPLOYEE_VIEW_NAME,
                {
                    columns: J.employeeTableColumns,
                    joins: [
                        {
                            foreignSource: viewId(J.departmentsView.id),
                            on: [J.fkColumnId, "=", J.pkColumnId],
                            columns: [
                                {
                                    parentColumnId: J.foreignColumnId,
                                    attributes: {},
                                },
                            ],
                        },
                    ],
                },
                { conditions: [], sortColumns: [], groupColumns: [] }
            )
        )) as T.ViewDescriptor
    })
    test("join-related metadata are gone after deleteView", async () => {
        const data = (await core.events.request(
            req.getViewData(DB_CONN_ID, J.employeeView.id)
        )) as {
            joins: T.JoinDescriptor[]
        }
        expect(data.joins.length).not.toBe(0)
        await deleteJoinTestView()
        const rows = (await core.events.request(select(DB_CONN_ID, V.VIEW_JOINS))) as any[]
        expect(rows.length).toBe(0)
    })
    afterAll(async () => {
        await teardownJoinTest()
    })
})

/**
 * Join multiple times to the same table, and get the same column. Tests that
 * the aliasing functionality for columns and data sources works.
 */
describe("multiple joins to the same table", () => {
    const FK_COLUMN_2 = "notdepartment"
    let fkColumnId2: number
    let join2: T.JoinDescriptor
    let firstNameColumn: T.ColumnInfo
    let fkColumn1: T.ColumnInfo
    let fkColumn2: T.ColumnInfo
    let data: T.ViewData
    beforeAll(async () => {
        await setupJoinTest()
        // same name -> need this attribute to tell them apart
        await core.events.request(
            req.addColumnAttribute(DB_CONN_ID, {
                name: "second",
                type: ColumnType.string,
                options: [],
            })
        )
        await createJoinTestView(true)
        fkColumnId2 = (
            (await core.events.request(
                createColumnInTable(DB_CONN_ID, J.employeeTable.id, FK_COLUMN_2, ColumnType.integer)
            )) as any
        ).id
        join2 = (await core.events.request(
            req.addJoinToView(DB_CONN_ID, J.employeeView.id, {
                foreignSource: viewId(J.departmentsView.id),
                on: [fkColumnId2, "=", J.pkColumnId],
                columns: [
                    {
                        parentColumnId: J.foreignColumnId,
                        attributes: { second: true },
                    },
                ],
            })
        )) as T.JoinDescriptor
        // populate: put the link to the opposite department in FK_2
        await core.events.request(
            update(DB_CONN_ID, J.employeeTable.key, {
                condition: ["first_name", "John"],
                update: { [FK_COLUMN_2]: 2 },
            })
        )
        await core.events.request(
            update(DB_CONN_ID, J.employeeTable.key, {
                condition: ["first_name", "Jane"],
                update: { [FK_COLUMN_2]: 1 },
            })
        )
        data = (await core.events.request(
            req.getViewData(DB_CONN_ID, J.employeeView.id)
        )) as T.ViewData
        firstNameColumn = data.columns.find(c => c.name === "first_name")!
        fkColumn1 = data.columns.find(c => c.name === FOREIGN_COLUMN && !c.attributes["second"])!
        fkColumn2 = data.columns.find(c => c.name === FOREIGN_COLUMN && c.attributes["second"])!
    })
    test("view data contain both columns, without clashes", async () => {
        expect(data.joins).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: join2.id,
                    foreignSource: viewId(J.departmentsView.id),
                }),
            ])
        )
        expect(data.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ joinId: J.join.id }),
                expect.objectContaining({ joinId: join2.id }),
            ])
        )
        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [firstNameColumn.key]: "John",
                    [fkColumn1.key]: "Dev Department Boss",
                    [fkColumn2.key]: "Testing Department Boss",
                }),
                expect.objectContaining({
                    [firstNameColumn.key]: "Jane",
                    [fkColumn1.key]: "Testing Department Boss",
                    [fkColumn2.key]: "Dev Department Boss",
                }),
            ])
        )
    })

    afterAll(async () => {
        await deleteJoinTestView()
        await core.events.request(req.removeColumnAttribute(DB_CONN_ID, "second"))
        await teardownJoinTest()
    })
})

/**
 * A cyclic join: Our basic scenario was that employees maps to departments
 * (can show where an employee works). Now, we link departments back to
 * employees (think "who is this department's boss?") and want to show this
 * in the employees view. That requires a cyclic join.
 */
describe("cyclic join (v1 -> v2 -> v1)", () => {
    let fkColumn2: T.PM_Column
    let v1Info: T.ViewInfo
    let v1Data: T.ViewData
    // primary key of v1
    let pkColumn1: T.ColumnInfo
    // column of v1 that will appear in v2
    let foreignColumn1: T.ColumnInfo
    // column in v2 that maps to foreignColumn2
    let foreignForeignColumn: T.ColumnInfo
    // new column of v1 that maps to foreignForeignColumn (v1 -> v2 -> v1)
    let hierarchicalColumn: T.ColumnInfo
    beforeAll(async () => {
        await setupJoinTest()
        await createJoinTestView(true)
        fkColumn2 = (await core.events.request(
            createColumnInTable(DB_CONN_ID, J.departmentsTable.id, "boss", ColumnType.integer)
        )) as T.PM_Column
        v1Info = (await core.events.request(
            req.getViewInfo(DB_CONN_ID, J.employeeView.id)
        )) as T.ViewInfo
        pkColumn1 = v1Info.columns.find(c => c.name === V.ID)!
        foreignColumn1 = v1Info.columns.find(c => c.name === "first_name")!
        await core.events.request(
            req.addJoinToView(DB_CONN_ID, J.departmentsView.id, {
                foreignSource: viewId(J.employeeView.id),
                on: [fkColumn2.id, "=", pkColumn1.id],
                columns: [{ parentColumnId: foreignColumn1.id, attributes: {} }],
            })
        )
        // insert foreign key values into departments table
        await core.events.request(
            update(DB_CONN_ID, J.departmentsTable.key, {
                condition: ["name", "development"],
                update: { [fkColumn2.name]: 2 },
            })
        )
        await core.events.request(
            update(DB_CONN_ID, J.departmentsTable.key, {
                condition: ["name", "testing"],
                update: { [fkColumn2.name]: 1 },
            })
        )
        const joinViewInfo = (await core.events.request(
            req.getViewInfo(DB_CONN_ID, J.departmentsView.id)
        )) as T.ViewInfo
        foreignForeignColumn = joinViewInfo.columns.find(c => c.name === "first_name")!
        hierarchicalColumn = (await core.events.request(
            req.addColumnToView(
                DB_CONN_ID,
                J.employeeView.id,
                { parentColumnId: foreignForeignColumn.id, attributes: {} },
                J.join.id
            )
        )) as T.ColumnInfo
        v1Data = (await core.events.request(
            req.getViewData(DB_CONN_ID, J.employeeView.id)
        )) as T.ViewData
    })
    test("view data contain cyclic foreign column", async () => {
        expect(v1Data.columns).toEqual(
            expect.arrayContaining([expect.objectContaining(hierarchicalColumn)])
        )
        expect(v1Data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [foreignColumn1.key]: "John",
                    [hierarchicalColumn.key]: "Jane",
                }),
            ])
        )
        expect(v1Data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [foreignColumn1.key]: "Jane",
                    [hierarchicalColumn.key]: "John",
                }),
            ])
        )
    })
    afterAll(async () => {
        await deleteJoinTestView()
        await teardownJoinTest()
    })
})

describe("delete a join", () => {
    beforeAll(async () => {
        await setupJoinTest()
        await createJoinTestView(true)
    })
    test("join and its columns are gone from the view", async () => {
        await core.events.request(req.removeJoinFromView(DB_CONN_ID, J.join.id))
        const info = (await core.events.request(
            req.getViewInfo(DB_CONN_ID, J.employeeView.id)
        )) as T.ViewInfo
        expect(info.joins).toEqual([])
        info.columns.map(c => expect(c.joinId).toBe(null))
    })
    afterAll(async () => {
        await deleteJoinTestView()
        await teardownJoinTest()
    })
})

// Join "backwards": my primary key to your foreign key instead of vice versa
describe("join with 1:n instead of n:1 relationship", () => {
    beforeAll(async () => {
        await setupJoinTest()
        await createJoinTestView(true)

        // add an extra join from departments to employees, but using departments' primary key
        // and employees' foreign key, not vice versa. Unfortunately, the situation is not
        // symmetric: We previously joined where [emp.table]foreign key = [dept.view]primary key.
        // now, we are joining [dept.table]primary key = [emp.view]foreign key. The foreign key
        // in the view has to be created and we must find the table-PK of departments.
        const joinViewPkColumn: T.ColumnInfo = await core.events.request(
            req.getColumnInfo(DB_CONN_ID, J.pkColumnId)
        )
        const employeeViewInfo: T.ViewInfo = await core.events.request(
            req.getViewInfo(DB_CONN_ID, J.employeeView.id)
        )
        const fkViewColumn: T.ColumnInfo = await core.events.request(
            req.addColumnToView(DB_CONN_ID, J.employeeView.id, {
                parentColumnId: J.fkColumnId,
                attributes: {},
            })
        )
        const nameColumn = employeeViewInfo.columns.find(c => c.name === "last_name")!
        await core.events.request(
            req.addJoinToView(DB_CONN_ID, J.departmentsView.id, {
                foreignSource: viewId(J.employeeView.id),
                on: [joinViewPkColumn.parentColumnId, "=", fkViewColumn.id],
                columns: [{ parentColumnId: nameColumn.id, attributes: {} }],
            })
        )

        // link both rows with "Dev Department Boss".
        await core.events.request(
            update(DB_CONN_ID, J.employeeTable.key, {
                condition: ["first_name", "Jane"],
                update: { [FK_COLUMN]: 1 },
            })
        )
    })
    test("view data contain one row for each linkage", async () => {
        const data: T.ViewData = await core.events.request(
            req.getViewData(DB_CONN_ID, J.departmentsView.id)
        )
        const departmentHeadColumn = data.columns.find(c => c.name === FOREIGN_COLUMN)!
        const employeesLastNameColumn = data.columns.find(c => c.name === "last_name")!
        expect(departmentHeadColumn).toBeDefined()
        expect(employeesLastNameColumn).toBeDefined()
        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [departmentHeadColumn.key]: "Dev Department Boss",
                    [employeesLastNameColumn.key]: "Doe",
                }),
                expect.objectContaining({
                    [departmentHeadColumn.key]: "Dev Department Boss",
                    [employeesLastNameColumn.key]: "Stag",
                }),
                expect.objectContaining({
                    [departmentHeadColumn.key]: "Testing Department Boss",
                    [employeesLastNameColumn.key]: null,
                }),
            ])
        )
    })
    afterAll(async () => {
        await deleteJoinTestView()
        await teardownJoinTest()
    })
})

describe("join preGroup option (join source is table)", () => {
    beforeAll(async () => {
        await setupJoinTest()
        await core.events.request(
            insert(DB_CONN_ID, J.employeeTable.key, {
                first_name: "Bob",
                last_name: "Builder",
            })
        )
        await core.events.request(
            update(DB_CONN_ID, J.employeeTable.key, {
                condition: ["first_name", "Bob"],
                update: { [FK_COLUMN]: 1 },
            })
        )
    })
    test("without preGroup returns two foreign key columns", async () => {
        const departmentsColumns: T.PM_Column[] = await core.events.request(
            getColumnsFromTable(DB_CONN_ID, J.departmentsTable.id)
        )
        const departmentsIdColumn = departmentsColumns.find(c => c.name === "_id")!
        const employeeColumns: T.PM_Column[] = await core.events.request(
            getColumnsFromTable(DB_CONN_ID, J.employeeTable.id)
        )
        const join = (await core.events.request(
            req.addJoinToView(DB_CONN_ID, J.departmentsView.id, {
                foreignSource: tableId(J.employeeTable.id),
                on: [departmentsIdColumn.id, "=", J.fkColumnId],
                columns: [
                    {
                        parentColumnId: employeeColumns.find(col => col.name === "first_name")!.id,
                        attributes: {},
                    },
                ],
            })
        )) as T.JoinDescriptor
        const data = (await core.events.request(
            req.getViewData(DB_CONN_ID, J.departmentsView.id)
        )) as T.ViewData

        const nameColumn = data.columns.find(col => col.name === "name")!
        const firstNameColumn = data.columns.find(col => col.name === "first_name")!

        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [nameColumn.key]: "development",
                    [firstNameColumn.key]: "John",
                }),
                expect.objectContaining({
                    [nameColumn.key]: "development",
                    [firstNameColumn.key]: "Bob",
                }),
            ])
        )

        await core.events.request(req.removeJoinFromView(DB_CONN_ID, join.id))
    })
    test("preGroup only returns only one foreign key column", async () => {
        const departmentsColumns: T.PM_Column[] = await core.events.request(
            getColumnsFromTable(DB_CONN_ID, J.departmentsTable.id)
        )
        const departmentsIdColumn = departmentsColumns.find(c => c.name === "_id")!
        const employeeColumns: T.PM_Column[] = await core.events.request(
            getColumnsFromTable(DB_CONN_ID, J.employeeTable.id)
        )
        const join = (await core.events.request(
            req.addJoinToView(DB_CONN_ID, J.departmentsView.id, {
                foreignSource: tableId(J.employeeTable.id),
                on: [departmentsIdColumn.id, "=", J.fkColumnId],
                columns: [
                    {
                        parentColumnId: employeeColumns.find(col => col.name === "first_name")!.id,
                        attributes: {},
                    },
                ],
                preGroup: true,
            })
        )) as T.JoinDescriptor
        const data = (await core.events.request(
            req.getViewData(DB_CONN_ID, J.departmentsView.id)
        )) as T.ViewData

        const nameColumn = data.columns.find(col => col.name === "name")!
        const firstNameColumn = data.columns.find(col => col.name === "first_name")!

        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [nameColumn.key]: "development",
                    [firstNameColumn.key]: expect.arrayContaining(["John", "Bob"]),
                }),
            ])
        )

        await core.events.request(req.removeJoinFromView(DB_CONN_ID, join.id))
    })
    afterAll(async () => {
        await teardownJoinTest()
    })
})
describe("join preGroup option (join source is view)", () => {
    beforeAll(async () => {
        await setupJoinTest()
        await createJoinTestView(false)
        await core.events.request(
            insert(DB_CONN_ID, J.employeeTable.key, {
                first_name: "Bob",
                last_name: "Builder",
            })
        )
        await core.events.request(
            update(DB_CONN_ID, J.employeeTable.key, {
                condition: ["first_name", "Bob"],
                update: { [FK_COLUMN]: 1 },
            })
        )
    })
    test("without preGroup returns two foreign key columns", async () => {
        const departmentsColumns: T.PM_Column[] = await core.events.request(
            getColumnsFromTable(DB_CONN_ID, J.departmentsTable.id)
        )
        const departmentsIdColumn = departmentsColumns.find(c => c.name === "_id")!
        const employeesInfo: T.ViewInfo = await core.events.request(
            req.getViewInfo(DB_CONN_ID, J.employeeView.id)
        )
        const fkViewColumn = await core.events.request(
            req.addColumnToView(DB_CONN_ID, J.employeeView.id, {
                parentColumnId: J.fkColumnId,
                attributes: {},
            })
        )
        const employeesFirstNameColumn = employeesInfo.columns.find(
            col => col.name === "first_name"
        )!
        const join = (await core.events.request(
            req.addJoinToView(DB_CONN_ID, J.departmentsView.id, {
                foreignSource: viewId(J.employeeView.id),
                on: [departmentsIdColumn.id, "=", fkViewColumn.id],
                columns: [
                    {
                        parentColumnId: employeesFirstNameColumn.id,
                        attributes: {},
                    },
                ],
            })
        )) as T.JoinDescriptor
        const data = (await core.events
            .request(req.getViewData(DB_CONN_ID, J.departmentsView.id))
            .catch(e => {
                console.dir(e)
                return Promise.reject(e)
            })) as T.ViewData

        const nameColumn = data.columns.find(col => col.name === "name")!
        const firstNameColumn = data.columns.find(col => col.name === "first_name")!

        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [nameColumn.key]: "development",
                    [firstNameColumn.key]: "John",
                }),
                expect.objectContaining({
                    [nameColumn.key]: "development",
                    [firstNameColumn.key]: "Bob",
                }),
            ])
        )

        await core.events.request(req.removeJoinFromView(DB_CONN_ID, join.id))
    })
    test("preGroup only returns only one foreign key column", async () => {
        const departmentsColumns: T.PM_Column[] = await core.events.request(
            getColumnsFromTable(DB_CONN_ID, J.departmentsTable.id)
        )
        const departmentsIdColumn = departmentsColumns.find(c => c.name === "_id")!
        const employeesInfo: T.ViewInfo = await core.events.request(
            req.getViewInfo(DB_CONN_ID, J.employeeView.id)
        )
        const fkViewColumn = await core.events.request(
            req.addColumnToView(DB_CONN_ID, J.employeeView.id, {
                parentColumnId: J.fkColumnId,
                attributes: {},
            })
        )
        const employeesFirstNameColumn = employeesInfo.columns.find(
            col => col.name === "first_name"
        )!
        const join = (await core.events.request(
            req.addJoinToView(DB_CONN_ID, J.departmentsView.id, {
                foreignSource: viewId(J.employeeView.id),
                on: [departmentsIdColumn.id, "=", fkViewColumn.id],
                columns: [
                    {
                        parentColumnId: employeesFirstNameColumn.id,
                        attributes: {},
                    },
                ],
                preGroup: true,
            })
        )) as T.JoinDescriptor
        const data = (await core.events.request(
            req.getViewData(DB_CONN_ID, J.departmentsView.id)
        )) as T.ViewData

        const nameColumn = data.columns.find(col => col.name === "name")!
        const firstNameColumn = data.columns.find(col => col.name === "first_name")!

        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [nameColumn.key]: "development",
                    [firstNameColumn.key]: expect.arrayContaining(["John", "Bob"]),
                }),
            ])
        )

        await core.events.request(req.removeJoinFromView(DB_CONN_ID, join.id))
    })
    afterAll(async () => {
        await teardownJoinTest()
    })
})

// =============================================================================
// SETUP
async function setupJoinTest() {
    await setupJoinTestMetadata()
    await populateJoinTestTables()
}

async function setupJoinTestMetadata() {
    J.projectId = (
        (await core.events.request(createProject(DB_CONN_ID, USER_ID, PROJECT_NAME))) as {
            id: number
        }
    ).id
    J.employeeTable = (await core.events.request(
        createTableInProject(
            DB_CONN_ID,
            USER_ID,
            J.projectId,
            EMPLOYEE_TABLE_NAME,
            EMPLOYEE_TABLE_COLUMNS
        )
    )) as T.TableDescriptor
    J.employeeTableColumns = (
        (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, J.employeeTable.id)
        )) as T.PM_Column[]
    ).map(col => ({ parentColumnId: col.id, attributes: {} }))

    J.departmentsTable = (await core.events.request(
        createTableInProject(
            DB_CONN_ID,
            USER_ID,
            J.projectId,
            DEPARTMENTS_TABLE_NAME,
            DEPARTMENTS_TABLE_COLUMNS
        )
    )) as T.TableDescriptor
    // need to pair these with keys for now, so we can find specific ones below.
    J.departmentsTableColumns = (
        (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, J.departmentsTable.id)
        )) as T.PM_Column[]
    ).map(col => ({ parentColumnId: col.id, attributes: {} }))
    J.departmentsView = (await core.events.request(
        req.createView(
            DB_CONN_ID,
            tableId(J.departmentsTable.id),
            DEPARTMENTS_VIEW_NAME,
            { columns: J.departmentsTableColumns, joins: [] },
            { conditions: [], sortColumns: [], groupColumns: [] }
        )
    )) as T.ViewDescriptor
    J.departmentsViewColumns = (
        (await core.events.request(req.getViewInfo(DB_CONN_ID, J.departmentsView.id))) as T.ViewInfo
    ).columns

    J.fkColumnId = (
        (await core.events.request(
            createColumnInTable(DB_CONN_ID, J.employeeTable.id, FK_COLUMN, ColumnType.integer)
        )) as T.PM_Column
    ).id
    J.pkColumnId = J.departmentsViewColumns.find(c => c.name === V.ID)!.id
    // here is where we need the view columns' names.
    J.foreignColumnId = J.departmentsViewColumns.find(c => c.name === FOREIGN_COLUMN)!.id
}
async function populateJoinTestTables() {
    await core.events.request(
        insert(DB_CONN_ID, J.employeeTable.key, {
            first_name: "John",
            last_name: "Doe",
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, J.employeeTable.key, {
            first_name: "Jane",
            last_name: "Stag",
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, J.departmentsTable.key, {
            name: "development",
            head: "Dev Department Boss",
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, J.departmentsTable.key, {
            name: "testing",
            head: "Testing Department Boss",
        })
    )
    await core.events.request(
        update(DB_CONN_ID, J.employeeTable.key, {
            condition: ["first_name", "John"],
            update: { [FK_COLUMN]: 1 },
        })
    )
    await core.events.request(
        update(DB_CONN_ID, J.employeeTable.key, {
            condition: ["first_name", "Jane"],
            update: { [FK_COLUMN]: 2 },
        })
    )
}
async function teardownJoinTest() {
    // managing employeeView is up to the tests, everything else is torn down here.
    await core.events.request(removeTable(DB_CONN_ID, J.employeeTable.id))
    await core.events.request(req.deleteView(DB_CONN_ID, J.departmentsView.id))
    await core.events.request(removeTable(DB_CONN_ID, J.departmentsTable.id))
    await core.events.request(removeProject(DB_CONN_ID, J.projectId))
    J.employeeView = { id: -1, name: "" }
    J.employeeTableColumns = []
    J.employeeTable = { id: -1, name: "", key: "" }
    J.departmentsViewColumns = []
    J.departmentsView = { id: -1, name: "" }
    J.departmentsTableColumns = []
    J.departmentsTable = { id: -1, name: "", key: "" }
    J.projectId = -1
    J.join = {
        id: -1,
        foreignSource: { type: 0, id: -1 } as SelectableSpecifier,
        on: [-1, "=", -1],
        preGroup: false,
    }
    J.fkColumnId = -1
    J.pkColumnId = -1
    J.foreignColumnId = -1
}

async function createJoinTestView(withJoin: boolean = false) {
    const joins: T.JoinSpecifier[] = withJoin
        ? [
              {
                  foreignSource: viewId(J.departmentsView.id),
                  on: [J.fkColumnId, "=", J.pkColumnId],
                  columns: [{ parentColumnId: J.foreignColumnId, attributes: {} }],
              },
          ]
        : []
    J.employeeView = (await core.events.request(
        req.createView(
            DB_CONN_ID,
            tableId(J.employeeTable.id),
            EMPLOYEE_VIEW_NAME,
            { columns: J.employeeTableColumns, joins },
            { conditions: [], sortColumns: [], groupColumns: [] }
        )
    )) as T.ViewDescriptor
    const info = (await core.events.request(
        req.getViewInfo(DB_CONN_ID, J.employeeView.id)
    )) as T.ViewInfo
    J.join = info.joins[0]
}
async function deleteJoinTestView() {
    return core.events.request(req.deleteView(DB_CONN_ID, J.employeeView.id, true))
}
