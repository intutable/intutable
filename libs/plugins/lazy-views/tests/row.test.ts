/**
 * Test the filtering of rows via WHERE clauses in views. To be considered
 * as an extension of the central test suite in column.test.ts
 */
import path from "path"
import { Core, EventSystem } from "core"
import { ColumnType, SimpleColumnOption } from "@intutable/database/dist/types"
import { openConnection, insert } from "@intutable/database/dist/requests"
import { TableInfo } from "@intutable/project-management/dist/types"
import {
    createTableInProject,
    createColumnInTable,
    getColumnsFromTable,
    getTableInfo,
} from "@intutable/project-management/dist/requests"

import { types as T } from "../src"
import { requests as req } from "../src"
import { tableId } from "../src"
import { condition as c } from "../src"

import { PROJECT_ID, setupTestTable, deleteTestTable } from "./setup"

let DB_CONN_ID: string
const TEST_TABLE = "tv_employees_row"
const TEST_TABLE_Q = "p1_tv_employees_row"
const TEST_TABLE_OWNER = 1
const FOREIGN_TABLE = "tv_salaries_union"
const TEST_VIEW = "tv_departments_row"
const EMPTY_ROW_OPTIONS = {
    conditions: [],
    groupColumns: [],
    sortColumns: [],
}

let core: Core

let testTable: T.TableDescriptor
let foreignTable: T.TableDescriptor
let testColumnOptions: T.ColumnOptions
let testRowOptions: T.RowOptions

/**
 * We use the employees-with-departments-and-salaries table from {@link ./setup}
 * but adding another joined table to ensure that the functionality works
 * across joins.
 */
beforeAll(async () => {
    core = await Core.create(
        [path.join(__dirname, "../node_modules/@intutable/*"), path.join(__dirname, "..")],
        new EventSystem(false)
    )
    const open = (await core.events.request(openConnection("admin", "admin"))) as {
        connectionId: string
    }
    DB_CONN_ID = open.connectionId
    let { tableId: testTableId_, columns: testTableColumns } = await setupTestTable(
        DB_CONN_ID,
        core,
        TEST_TABLE,
        TEST_TABLE_OWNER
    )
    testTable = {
        id: testTableId_,
        name: TEST_TABLE,
        key: TEST_TABLE_Q,
    }
    // create extra table to join to. It's a list of salary classes a
    // union (the software engineer's union, go figure) agreed on. We can
    // then map each employee to their "should be" salary and do all kinds of
    // complex WHERE clauses based on how the actual salary compares.
    foreignTable = await core.events.request(
        createTableInProject(DB_CONN_ID, PROJECT_ID, TEST_TABLE_OWNER, FOREIGN_TABLE, [
            {
                name: "_id",
                type: ColumnType.integer,
                options: [SimpleColumnOption.notNullable, SimpleColumnOption.primary],
            },
            {
                name: "standard_salary",
                type: ColumnType.integer,
                options: [SimpleColumnOption.nullable],
            },
        ])
    )
    const foreignTableInfo = (await core.events.request(
        getTableInfo(DB_CONN_ID, foreignTable.id)
    )) as TableInfo
    const fkColumn = await core.events.request(
        createColumnInTable(DB_CONN_ID, testTable.id, "standard_salary", ColumnType.integer)
    )
    const pkColumn = foreignTableInfo.columns.find(c => c.name === "_id")!
    const standardSalaryColumn = foreignTableInfo.columns.find(c => c.name === "standard_salary")!
    testColumnOptions = {
        columns: testTableColumns,
        joins: [
            {
                foreignSource: tableId(foreignTable.id),
                on: [fkColumn.id, "=", pkColumn.id],
                columns: [
                    {
                        parentColumnId: standardSalaryColumn.id,
                        attributes: {},
                    },
                ],
            },
        ],
    }
    const testViewBaseColumns = (await core.events.request(
        getColumnsFromTable(DB_CONN_ID, testTable.id)
    )) as T.PM_Column[]
    const departmentColumn = testViewBaseColumns.find(c => c.name === "department")!
    // we will filter the view by department and later by salary
    testRowOptions = {
        conditions: [
            {
                kind: c.ConditionKind.Infix,
                left: {
                    kind: c.OperandKind.Column,
                    column: {
                        parentColumnId: departmentColumn.id,
                        joinId: null,
                    },
                },
                operator: "=",
                right: {
                    kind: c.OperandKind.Literal,
                    value: "testing",
                },
            },
        ],
        groupColumns: [],
        sortColumns: [],
    }
    // object data
    await core.events.request(
        insert(DB_CONN_ID, foreignTable.key, {
            ["_id"]: 1,
            ["standard_salary"]: 4000,
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, foreignTable.key, {
            ["_id"]: 2,
            ["standard_salary"]: 3500,
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, foreignTable.key, {
            ["_id"]: 3,
            ["standard_salary"]: 4500,
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, TEST_TABLE_Q, {
            name: "Johnnnnn Doe",
            department: "development",
            salary_month: 4000,
            standard_salary: 1,
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, TEST_TABLE_Q, {
            name: "Jack Black",
            department: "development",
            salary_month: 4001,
            standard_salary: 2,
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, TEST_TABLE_Q, {
            name: "Jim Jones",
            department: "development",
            salary_month: 4000,
            standard_salary: 2,
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, TEST_TABLE_Q, {
            name: "Jane Brown",
            department: "testing",
            salary_month: 4000,
            standard_salary: 1,
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, TEST_TABLE_Q, {
            name: "Jessica Smith",
            department: "testing",
            salary_month: 4000,
            standard_salary: 1,
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, TEST_TABLE_Q, {
            name: "Jill Miller",
            department: "testing",
            salary_month: 4001,
            standard_salary: 3,
        })
    )
})

afterAll(async () => {
    await deleteTestTable(DB_CONN_ID, core, testTable.id)
    await core.plugins.closeAll()
})

/**
 * Basic `WHERE column='literal'` clause.
 */
describe("can create a view with a simple row filter", () => {
    const FILTER_COLUMN = "department"
    let id: number
    let data: T.ViewData

    beforeAll(async () => {
        id = (await createRowTestView()).id
        data = (await core.events.request(req.getViewData(DB_CONN_ID, id))) as T.ViewData
    })
    afterAll(async () => {
        return core.events.request(req.deleteView(DB_CONN_ID, id))
    })
    test("view's rows fulfill simple condition", async () => {
        const deptColumn = data.columns.find(c => c.name === FILTER_COLUMN)!
        data.rows.map(row =>
            expect(row).toEqual(
                expect.objectContaining({
                    [deptColumn.key]: "testing",
                })
            )
        )
    })
    test("getViewData returns row options", async () => {
        expect(data).toHaveProperty("rowOptions", testRowOptions)
    })
})

/**
 * Simple compound clause. You can specify an array of conditions which are
 * joined with `AND`.
 */
describe("can create a view with a compound row filter", () => {
    let viewId: number

    beforeAll(async () => {
        const baseTable = (await core.events.request(
            getTableInfo(DB_CONN_ID, testTable.id)
        )) as TableInfo
        const departmentColumn = baseTable.columns.find(c => c.name === "department")!
        const salaryColumn = baseTable.columns.find(c => c.name === "salary_month")!
        const doubleCondition: T.Condition[] = [
            {
                kind: c.ConditionKind.Infix,
                left: {
                    kind: c.OperandKind.Column,
                    column: {
                        parentColumnId: departmentColumn.id,
                        joinId: null,
                    },
                },
                operator: "=",
                right: { kind: c.OperandKind.Literal, value: "testing" },
            },
            {
                kind: c.ConditionKind.Infix,
                left: {
                    kind: c.OperandKind.Column,
                    column: { parentColumnId: salaryColumn.id, joinId: null },
                },
                operator: "=",
                right: { kind: c.OperandKind.Literal, value: 4001 },
            },
        ]
        const viewQuery = await core.events.request(
            req.createView(DB_CONN_ID, tableId(testTable.id), TEST_VIEW, testColumnOptions, {
                ...testRowOptions,
                conditions: doubleCondition,
            })
        )
        viewId = viewQuery.id
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })
    test("view's rows fulfill both conditions", async () => {
        let data = (await core.events.request(req.getViewData(DB_CONN_ID, viewId))) as T.ViewData
        expect(data.rows.length).toBe(1)
        const nameColumn = data.columns.find(c => c.name === "name")!
        expect(data.rows).toEqual(
            expect.arrayContaining([expect.objectContaining({ [nameColumn.key]: "Jill Miller" })])
        )
    })
})

/**
 * Various more complex conditions: `NOT`, nested `AND`/`OR`, and various
 * operators other than `=`.
 */
describe("more complex conditions", () => {
    const DEPARTMENT = "department"
    const SALARY = "salary_month"
    const STANDARD_SALARY = "standard_salary"
    let id: number
    let info: T.ViewInfo

    beforeAll(async () => {
        id = (await createRowTestView()).id
        info = (await core.events.request(req.getViewInfo(DB_CONN_ID, id))) as T.ViewInfo
    })
    afterAll(async () => {
        return core.events.request(req.deleteView(DB_CONN_ID, id))
    })
    test("WHERE ... IN condition", async () => {
        const standardSalary = info.columns.find(c => c.name === STANDARD_SALARY)!
        const name = info.columns.find(c => c.name === "name")!
        const rowOptions = {
            conditions: [c.where(standardSalary, "IN", [3500, 4500])],
            groupColumns: [],
            sortColumns: [],
        }
        await core.events.request(req.changeRowOptions(DB_CONN_ID, id, rowOptions))
        const data = (await core.events.request(req.getViewData(DB_CONN_ID, id))) as T.ViewData
        expect(data.rows.length).toBe(3)
        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ [name.key]: "Jack Black" }),
                expect.objectContaining({ [name.key]: "Jim Jones" }),
                expect.objectContaining({ [name.key]: "Jill Miller" }),
            ])
        )
    })
    /**
     * "Find all employees that are paid more than standard". Allows us to check
     * the > operator and that we can compare two columns to each other.
     */
    test("compare one column to another", async () => {
        const salary = info.columns.find(c => c.name === SALARY)!
        const standardSalary = info.columns.find(c => c.name === STANDARD_SALARY)!
        const rowOptions = {
            conditions: [c.where(salary, ">", standardSalary)],
            groupColumns: [],
            sortColumns: [],
        }
        await core.events.request(req.changeRowOptions(DB_CONN_ID, id, rowOptions))
        const data = (await core.events.request(req.getViewData(DB_CONN_ID, id))) as T.ViewData
        const nameColumn = data.columns.find(c => c.name === "name")!
        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [nameColumn.key]: "Jack Black",
                }),
                expect.objectContaining({
                    [nameColumn.key]: "Jim Jones",
                }),
            ])
        )
    })

    /** Negation: all employees not in the testing department. */
    test("negated condition", async () => {
        const notOptions = {
            ...testRowOptions,
            conditions: [c.not(testRowOptions.conditions[0])],
        }
        await core.events.request(req.changeRowOptions(DB_CONN_ID, id, notOptions))
        const data = (await core.events.request(req.getViewData(DB_CONN_ID, id))) as T.ViewData
        const deptColumn = data.columns.find(c => c.name === "department")!
        data.rows.map(row =>
            expect(row).not.toEqual(
                expect.objectContaining({
                    [deptColumn.key]: "testing",
                })
            )
        )
    })
    /**
     * Just to check that the success of the composite condition wasn't a fluke.
     * WHERE true AND (false OR true) should be false if we messed up, but true
     * if the implementation is correct.
     */
    test("deeply nested composite", async () => {
        const nestedOptions: T.RowOptions = {
            ...testRowOptions,
            conditions: [
                c.and(
                    { kind: c.ConditionKind.Boolean, value: true },
                    c.or(
                        { kind: c.ConditionKind.Boolean, value: true },
                        c.and<c.InfixCondition>(
                            { kind: c.ConditionKind.Boolean, value: true },
                            { kind: c.ConditionKind.Boolean, value: false }
                        )
                    )
                ),
            ],
        }
        await core.events.request(req.changeRowOptions(DB_CONN_ID, id, nestedOptions))
        const data = (await core.events.request(req.getViewData(DB_CONN_ID, id))) as T.ViewData
        expect(data.rows.length).not.toBe(0)
    })
    /**
     * Either dept=testing OR salary >= 4001, but with NAND in order to
     * test that we can do nested conditions
     */
    test("not and", async () => {
        const department = info.columns.find(c => c.name === DEPARTMENT)!
        const salary = info.columns.find(c => c.name === SALARY)!
        const nandOptions: T.RowOptions = {
            ...testRowOptions,
            conditions: [
                c.not(c.and(c.where(department, "=", "development"), c.where(salary, "<", 4001))),
            ],
        }
        await core.events.request(req.changeRowOptions(DB_CONN_ID, id, nandOptions))
        const data = (await core.events.request(req.getViewData(DB_CONN_ID, id))) as T.ViewData
        expect(data.rows.length).toBe(4)
        expect(data.rows).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [department.key]: "development",
                    [salary.key]: 4000,
                }),
            ])
        )
    })
})

/**
 * Making sure `getViewOptions` still gives back the conditions you passed in.
 */
describe("getViewOptions recreates the condition prop", () => {
    let viewId: number

    beforeAll(async () => {
        let viewQuery = (await createRowTestView()) as any
        viewId = viewQuery.id
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })
    test("selected options contain the same condition", async () => {
        let props = (await core.events.request(
            req.getViewOptions(DB_CONN_ID, viewId)
        )) as T.ViewOptions
        expect(props.rowOptions).toEqual(testRowOptions)
    })
})

describe("change row options", () => {
    let viewId: number

    beforeAll(async () => {
        let viewQuery = (await createRowTestView()) as any
        viewId = viewQuery.id
        await core.events.request(req.changeRowOptions(DB_CONN_ID, viewId, EMPTY_ROW_OPTIONS))
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })
    test("data now contain all departments", async () => {
        const data = (await core.events.request(req.getViewData(DB_CONN_ID, viewId))) as T.ViewData
        const deptColumn = data.columns.find(c => c.name === "department")!
        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [deptColumn.key]: "development",
                }),
            ])
        )
    })
})

/** Sort rows by a column's (or multiple columns') value. */
describe("sorting rows", () => {
    let viewId: number
    let nameColumn: T.ColumnInfo
    let deptColumn: T.ColumnInfo

    beforeEach(async () => {
        let view = await core.events.request(
            req.createView(
                DB_CONN_ID,
                tableId(testTable.id),
                TEST_VIEW,
                testColumnOptions,
                EMPTY_ROW_OPTIONS
            )
        )
        viewId = view.id
        // find the requisite columns...
        const info: T.ViewInfo = (await core.events.request(
            req.getViewInfo(DB_CONN_ID, viewId)
        )) as T.ViewInfo
        nameColumn = info.columns.find(c => c.name === "name")!
        deptColumn = info.columns.find(c => c.name === "department")!
    })

    afterEach(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })
    test("rows are not sorted by default", async () => {
        const data = (await core.events.request(req.getViewData(DB_CONN_ID, viewId))) as T.ViewData
        const nameColumn = data.columns.find(c => c.name === "name")!
        expect(data.rows[0][nameColumn.key]).not.toBe("Jack Black")
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })

    test("rows are sorted after applying new sort options", async () => {
        const sortOptions: T.RowOptions = {
            conditions: [],
            groupColumns: [],
            sortColumns: [
                {
                    column: nameColumn,
                    order: T.SortOrder.Ascending,
                },
            ],
        }

        await core.events.request(req.changeRowOptions(DB_CONN_ID, viewId, sortOptions))
        const data = await core.events.request(req.getViewData(DB_CONN_ID, viewId))
        expect(data.rows[0][nameColumn.key]).toBe("Jack Black")
    })

    test("multiple sort columns", async () => {
        const sortOptions: T.RowOptions = {
            conditions: [],
            groupColumns: [],
            sortColumns: [
                {
                    column: deptColumn,
                    order: T.SortOrder.Descending,
                },
                {
                    column: nameColumn,
                    order: T.SortOrder.Ascending,
                },
            ],
        }

        await core.events.request(req.changeRowOptions(DB_CONN_ID, viewId, sortOptions))

        const data = (await core.events.request(req.getViewData(DB_CONN_ID, viewId))) as T.ViewData
        expect(data.rows[0][nameColumn.key]).toBe("Jane Brown")
    })
})

/** GROUP BY functionality. */
describe("grouping", () => {
    let viewId: number
    let departmentColumn: T.ColumnInfo
    let standardSalaryColumn: T.ColumnInfo
    let data: T.ViewData

    beforeAll(async () => {
        viewId = (await createRowTestView()).id
        const info: T.ViewInfo = (await core.events.request(
            req.getViewInfo(DB_CONN_ID, viewId)
        )) as T.ViewInfo
        departmentColumn = info.columns.find(c => c.name === "department")!
        standardSalaryColumn = info.columns.find(c => c.name === "standard_salary")!
    })
    afterAll(async () => {
        await core.events.request(req.deleteView(DB_CONN_ID, viewId))
    })
    test("can group by one column", async () => {
        await core.events.request(
            req.changeRowOptions(DB_CONN_ID, viewId, {
                ...EMPTY_ROW_OPTIONS,
                groupColumns: [departmentColumn],
            })
        )
        data = (await core.events.request(req.getViewData(DB_CONN_ID, viewId))) as T.ViewData
        const dept = data.columns.find(c => c.name === "department")!
        const name = data.columns.find(c => c.name === "name")!
        // now, the plugin should have aggregated all the non-grouping fields
        // into arrays.
        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [dept.key]: "development",
                    [name.key]: expect.arrayContaining(["Johnnnnn Doe", "Jack Black", "Jim Jones"]),
                }),
                expect.objectContaining({
                    [dept.key]: "testing",
                    [name.key]: expect.arrayContaining([
                        "Jane Brown",
                        "Jessica Smith",
                        "Jill Miller",
                    ]),
                }),
            ])
        )
    })
    test("can group by two columns", async () => {
        await core.events.request(
            req.changeRowOptions(DB_CONN_ID, viewId, {
                ...EMPTY_ROW_OPTIONS,
                groupColumns: [departmentColumn, standardSalaryColumn],
            })
        )
        data = (await core.events.request(req.getViewData(DB_CONN_ID, viewId))) as T.ViewData
        const dept = data.columns.find(c => c.name === "department")!
        const name = data.columns.find(c => c.name === "name")!
        expect(data.rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [dept.key]: "development",
                    [standardSalaryColumn.key]: 3500,
                    [name.key]: expect.arrayContaining(["Jack Black", "Jim Jones"]),
                }),
                expect.objectContaining({
                    [dept.key]: "testing",
                    [standardSalaryColumn.key]: 4000,
                    [name.key]: expect.arrayContaining(["Jane Brown", "Jessica Smith"]),
                }),
            ])
        )
    })
})

/**
 * Basic `WHERE column='literal'` clause.
 */
describe("one-time row options", () => {
    let id: number

    beforeAll(async () => {
        id = (await createRowTestView()).id
    })
    afterAll(async () => {
        return core.events.request(req.deleteView(DB_CONN_ID, id))
    })
    test("override conditions: rows changed, metadata remain the same", async () => {
        const testViewBaseColumns = (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, testTable.id)
        )) as T.PM_Column[]
        const departmentColumn = testViewBaseColumns.find(c => c.name === "department")!
        // the same as testRowOptions, except with "!=" instead of "="
        let invertedRowOptions: T.RowOptions = {
            conditions: [
                {
                    kind: c.ConditionKind.Infix,
                    left: {
                        kind: c.OperandKind.Column,
                        column: {
                            parentColumnId: departmentColumn.id,
                            joinId: null,
                        },
                    },
                    operator: "!=",
                    right: {
                        kind: c.OperandKind.Literal,
                        value: "testing",
                    },
                },
            ],
            groupColumns: [],
            sortColumns: [],
        }

        const data: T.ViewData = await core.events.request(
            req.getViewData(DB_CONN_ID, id, invertedRowOptions)
        )

        const deptColumn = data.columns.find(c => c.name === "department")!
        // rows have the new conditions:
        data.rows.map(row =>
            expect(row).not.toEqual(
                expect.objectContaining({
                    [deptColumn.key]: "testing",
                })
            )
        )
        // metadata still contain the original ones:
        expect(data.rowOptions).toEqual(testRowOptions)
    })
    test("override sorting, keep conditions the same", async () => {
        const testViewBaseColumns = (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, testTable.id)
        )) as T.PM_Column[]
        const nameBaseColumn = testViewBaseColumns.find(c => c.name === "name")!
        const sortingRowOptions = {
            ...testRowOptions,
            sortColumns: [
                {
                    column: { parentColumnId: nameBaseColumn.id, joinId: null },
                    order: T.SortOrder.Descending,
                },
            ],
        }
        const data: T.ViewData = await core.events.request(
            req.getViewData(DB_CONN_ID, id, sortingRowOptions)
        )
        const deptColumn = data.columns.find(c => c.name === "department")!
        data.rows.map(row =>
            expect(row).toEqual(
                expect.objectContaining({
                    [deptColumn.key]: "testing",
                })
            )
        )
        const nameColumn = data.columns.find(c => c.name === "name")!
        expect(data.rows[0][nameColumn.key]).toBe("Jill Miller")
    })
})

async function createRowTestView() {
    return core.events.request(
        req.createView(
            DB_CONN_ID,
            tableId(testTable.id),
            TEST_VIEW,
            testColumnOptions,
            testRowOptions
        )
    )
}
