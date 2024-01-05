import { Core } from "@intutable/core"
import {
    insert,
    select,
    openConnection,
    deleteRow,
} from "@intutable/database/dist/requests"
import { ColumnType, Column } from "@intutable/database/dist/types"
import {
    ProjectDescriptor,
    TableDescriptor,
    ColumnDescriptor,
    TableData,
    Row,
} from "../src/types"
import * as m from "../src/meta"

import {
    getProjects,
    createProject,
    removeProject,
    getTablesFromProject,
    createTableInProject,
    removeTable,
    getColumnsFromTable,
    createColumnInTable,
    changeProjectName,
    changeTableName,
    getTableInfo,
    getTableData,
    changeColumnName,
    changeColumnAttributes,
    removeColumn,
    getColumnInfo,
    merge,
    copy,
} from "../src/requests"
import path from "path"

let core: Core
let DB_CONN_ID = "1"
const USERNAME = "admin"
const PASSWORD = "admin"
const TEST_ROLE_ID = 1
const PROJECT_ONE: ProjectDescriptor = {
    id: 1,
    name: "project1",
}

const TABLE_ONE = {
    id: 1,
    name: "table1",
    key: "p1_table1",
    COLUMN0: {
        id: 1,
        name: m.ID,
    },
    COLUMN1: {
        id: 2,
        name: "column1",
    },
    COLUMN2: {
        id: 3,
        name: "column2",
    },
}

const TABLE_TWO = {
    id: 2,
    name: "table2",
    key: "p1_table2",
    COLUMN0: {
        id: 4,
        name: m.ID,
    },
    COLUMN3: {
        id: 5,
        name: "column3",
    },
    COLUMN4: {
        id: 6,
        name: "column4",
    },
}

beforeAll(async () => {
    core = await Core.create([
        path.join(__dirname, ".."),
        path.join(__dirname, "../node_modules/@intutable/database"),
    ])
    const open = await core.events.request(
        openConnection(USERNAME, PASSWORD)
    ) as any
    DB_CONN_ID = open.connectionId
})

async function setup() {
    const projects: any = await core.events.request(
        getProjects(DB_CONN_ID, TEST_ROLE_ID)
    )

    for (let project of projects) {
        await core.events.request(removeProject(DB_CONN_ID, project.id))
    }

    PROJECT_ONE.id = (
        (await core.events.request(
            createProject(DB_CONN_ID, TEST_ROLE_ID, "project1")
        )) as any
    ).id

    TABLE_ONE.id = (
        (await core.events.request(
            createTableInProject(
                DB_CONN_ID,
                TEST_ROLE_ID,
                PROJECT_ONE.id,
                TABLE_ONE.name
            )
        )) as any
    ).id

    TABLE_ONE.COLUMN0.id = (
        (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, TABLE_ONE.id)
        )) as ColumnDescriptor[]
    )[0].id
    TABLE_ONE.COLUMN1.id = (
        (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, TABLE_ONE.id)
        )) as TableDescriptor[]
    )[1].id

    await core.events.request(
        changeColumnName(
            DB_CONN_ID,
            TABLE_ONE.COLUMN1.id,
            TABLE_ONE.COLUMN1.name
        )
    )

    TABLE_ONE.COLUMN2.id = (
        (await core.events.request(
            createColumnInTable(DB_CONN_ID, TABLE_ONE.id, TABLE_ONE.COLUMN2.name)
        )) as any
    ).id

    TABLE_TWO.id = (
        (await core.events.request(
            createTableInProject(
                DB_CONN_ID,
                TEST_ROLE_ID,
                PROJECT_ONE.id,
                TABLE_TWO.name
            )
        )) as any
    ).id

    TABLE_TWO.COLUMN0.id = (
        (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, TABLE_TWO.id)
        )) as any
    )[0].id
    TABLE_TWO.COLUMN3.id = (
        (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, TABLE_TWO.id)
        )) as any
    )[1].id

    await core.events.request(
        changeColumnName(
            DB_CONN_ID,
            TABLE_TWO.COLUMN3.id,
            TABLE_TWO.COLUMN3.name
        )
    )

    TABLE_TWO.COLUMN4.id = (
        (await core.events.request(
            createColumnInTable(DB_CONN_ID, TABLE_TWO.id, TABLE_TWO.COLUMN4.name)
        )) as any
    ).id

    TABLE_ONE.key = "p" + PROJECT_ONE.id + "_table1"
    TABLE_TWO.key = "p" + PROJECT_ONE.id + "_table2"
    await core.events.request(
        insert(DB_CONN_ID, TABLE_TWO.key, {
            [TABLE_TWO.COLUMN3.name]: "data1",
            [TABLE_TWO.COLUMN4.name]: "data2",
        })
    )
}

afterAll(async () => {
    core.plugins.closeAll()
})

describe("Can manage projects", () => {
    beforeEach(setup)

    const PROJECT_TWO: ProjectDescriptor = {
        id: 2,
        name: "new project",
    }

    test("Create project", async () => {
        await core.events.request(
            createProject(DB_CONN_ID, TEST_ROLE_ID, PROJECT_TWO.name)
        )
        PROJECT_TWO.id = (
            (await core.events.request(
                getProjects(DB_CONN_ID, TEST_ROLE_ID)
            )) as any
        )[1].id

        const userProjects = await core.events.request(
            getProjects(DB_CONN_ID, TEST_ROLE_ID)
        )

        expect(userProjects).toEqual(
            expect.arrayContaining([
                {
                    id: PROJECT_ONE.id,
                    name: PROJECT_ONE.name,
                },
                {
                    id: PROJECT_TWO.id,
                    name: PROJECT_TWO.name,
                },
            ])
        )
    })

    test("Remove project including keep table condition", async () => {
        const tablesToKeep = [TABLE_ONE.id]

        await core.events.request(
            removeProject(DB_CONN_ID, PROJECT_ONE.id, tablesToKeep)
        )

        const projectsPostDelete = await core.events.request(
            getProjects(DB_CONN_ID, TEST_ROLE_ID)
        )
        expect(projectsPostDelete).toEqual([])

        const tablesPostDelete = (
            (await core.events.request(select(DB_CONN_ID, m.TABLES))) as any[]
        ).map((t: any) => t[m.TABLE_NAME])

        expect(tablesPostDelete).toContain(TABLE_ONE.name)
        expect(tablesPostDelete).not.toContain(TABLE_TWO.name)
    })
})

describe("Can manage tables", () => {
    beforeEach(setup)

    test("Add table to project", async () => {
        const tableName = "newTable"
        await core.events.request(
            createTableInProject(
                DB_CONN_ID,
                TEST_ROLE_ID,
                PROJECT_ONE.id,
                tableName
            )
        )

        const tables = (await core.events.request(
            getTablesFromProject(DB_CONN_ID, PROJECT_ONE.id)
        )) as TableDescriptor[]

        expect(tables).toEqual(
            expect.arrayContaining([
                {
                    id: TABLE_ONE.id,
                    name: "table1",
                    key: `p${PROJECT_ONE.id}_table1`,
                },
                {
                    id: TABLE_TWO.id,
                    name: "table2",
                    key: `p${PROJECT_ONE.id}_table2`,
                },
                {
                    id: TABLE_TWO.id + 1,
                    name: "newTable",
                    key: `p${PROJECT_ONE.id}_newTable`,
                },
            ])
        )
    })

    test("Add table to project - including column list", async () => {
        const tableName = "newTable"
        const columns: Column[] = [
            { name: "newColumn", type: ColumnType.string },
        ]
        await core.events.request(
            createTableInProject(
                DB_CONN_ID,
                TEST_ROLE_ID,
                PROJECT_ONE.id,
                tableName,
                columns
            )
        )

        const tables: any = await core.events.request(
            getTablesFromProject(DB_CONN_ID, PROJECT_ONE.id)
        )
        const newColumns = (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, tables[2].id)
        )) as ColumnDescriptor[]

        expect(tables).toEqual(
            expect.arrayContaining([
                {
                    id: TABLE_ONE.id,
                    name: "table1",
                    key: `p${PROJECT_ONE.id}_table1`,
                },
                {
                    id: TABLE_TWO.id,
                    name: "table2",
                    key: `p${PROJECT_ONE.id}_table2`,
                },
                {
                    id: TABLE_TWO.id + 1,
                    name: "newTable",
                    key: `p${PROJECT_ONE.id}_newTable`,
                },
            ])
        )

        expect(newColumns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: m.ID,
                    type: "increments",
                }),
                expect.objectContaining({
                    name: "newColumn",
                    type: "string",
                }),
            ])
        )
    })

    test("Remove table from project", async () => {
        await core.events.request(removeTable(DB_CONN_ID, TABLE_TWO.id))

        expect(
            await core.events.request(
                select(DB_CONN_ID, m.TABLES, {
                    condition: [m.ID, TABLE_TWO.id],
                })
            )
        ).toEqual([])

        expect(
            await core.events.request(
                select(DB_CONN_ID, m.PROJECTS_TABLES, {
                    condition: [m.TABLE_ID, TABLE_TWO.id],
                })
            )
        ).toEqual([])

        const columns = (await core.events.request(
            select(DB_CONN_ID, m.COLUMNS, {
                columns: [m.ID],
            })
        )) as any[]
        for (let column of columns) {
            // if the column's table cannot be found, it must be a leftover
            // column from a table that was deleted.
            let table = (await core.events.request(
                select(DB_CONN_ID, m.TABLES, {
                    columns: [m.TABLE_NAME], // whatever
                    join: {
                        table: m.COLUMNS,
                        on: [`${m.TABLES}.${m.ID}`, "=", m.TABLE_ID],
                    },
                    condition: [`${m.COLUMNS}.${m.ID}`, column[m.ID]],
                })
            )) as any[]
            expect(table.length).toBe(1)
        }
    })
})

describe("Can manage columns", () => {
    beforeEach(setup)

    test("Add column to table", async () => {
        const columnName = "newColumn"
        await core.events.request(
            createColumnInTable(DB_CONN_ID, TABLE_TWO.id, columnName)
        )

        const columns = await core.events.request(
            getColumnsFromTable(DB_CONN_ID, TABLE_TWO.id)
        )

        expect(columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: TABLE_TWO.COLUMN0.id,
                    name: m.ID,
                }),
                expect.objectContaining({
                    id: TABLE_TWO.COLUMN3.id,
                    name: "column3",
                }),
                expect.objectContaining({
                    id: TABLE_TWO.COLUMN4.id,
                    name: "column4",
                }),
                expect.objectContaining({
                    id: expect.any(Number),
                    name: "newColumn",
                }),
            ])
        )
    })

    test("Remove column from table", async () => {
        await core.events.request(removeColumn(DB_CONN_ID, TABLE_TWO.COLUMN4.id))

        // gone from object table
        const rowsQuery = (await core.events.request(
            select(DB_CONN_ID, TABLE_TWO.key)
        )) as any[]
        expect(rowsQuery.length).not.toBe(0)
        expect(rowsQuery[0]).not.toEqual(
            expect.objectContaining({
                [TABLE_TWO.COLUMN4.name]: expect.anything(),
            })
        )

        // gone from meta tables
        const columns = await core.events.request(
            getColumnsFromTable(DB_CONN_ID, TABLE_TWO.id)
        )

        expect(columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: TABLE_TWO.COLUMN0.id,
                    name: m.ID,
                }),
                expect.objectContaining({
                    id: TABLE_TWO.COLUMN3.id,
                    name: "column3",
                }),
            ])
        )
    })
})

describe("Change entities", () => {
    beforeEach(setup)

    test("Rename project", async () => {
        const newName = "newProjectName"

        const newProject = (await core.events.request(
            changeProjectName(DB_CONN_ID, PROJECT_ONE.id, newName)
        )) as ProjectDescriptor

        expect(newProject).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                name: newName,
            })
        )

        const projectNames = (
            (await core.events.request(
                getProjects(DB_CONN_ID, TEST_ROLE_ID)
            )) as ProjectDescriptor[]
        ).map(p => p.name)

        expect(projectNames).toEqual(["newProjectName"])
    })

    test("Rename table", async () => {
        const newName = "newTableName"

        const newTable = (await core.events.request(
            changeTableName(DB_CONN_ID, TABLE_ONE.id, newName)
        )) as TableDescriptor

        expect(newTable).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                key: expect.any(String),
                name: newName,
            })
        )

        const tableName = await core.events.request(
            select(DB_CONN_ID, m.TABLES, {
                columns: [m.TABLE_NAME],
                condition: [m.ID, TABLE_ONE.id],
            })
        )

        expect(tableName).toEqual([{ name: "newTableName" }])
    })

    test("Rename column of table", async () => {
        const newName = "newColumnName"

        const newColumn = (await core.events.request(
            changeColumnName(DB_CONN_ID, TABLE_ONE.COLUMN1.id, newName)
        )) as ColumnDescriptor
        expect(newColumn).toEqual(expect.objectContaining({ name: newName }))

        const columns: ColumnDescriptor[] = (await core.events.request(
            getColumnsFromTable(DB_CONN_ID, TABLE_ONE.id)
        )) as ColumnDescriptor[]

        expect(columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: TABLE_ONE.COLUMN0.id,
                    name: m.ID,
                }),
                expect.objectContaining({
                    id: TABLE_ONE.COLUMN1.id,
                    name: newName,
                }),
                expect.objectContaining({
                    id: TABLE_ONE.COLUMN2.id,
                    name: "column2",
                }),
            ])
        )
    })

    test("Change column attributes", async () => {
        const editable = 0
        const attributes = ["editable"]

        const newColumn = (await core.events.request(
            changeColumnAttributes(DB_CONN_ID, TABLE_TWO.COLUMN4.id, {
                editable,
            })
        )) as ColumnDescriptor

        expect(newColumn).toEqual(
            expect.objectContaining({
                attributes: expect.objectContaining({ editable }),
            })
        )

        const data = (await core.events.request(
            getTableData(DB_CONN_ID, TABLE_TWO.id, attributes)
        )) as TableData<Row>

        expect(data.table).toEqual({
            id: TABLE_TWO.id,
            key: `p${PROJECT_ONE.id}_${TABLE_TWO.name}`,
            name: TABLE_TWO.name,
        })
        expect(data.columns).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: TABLE_TWO.COLUMN0.name,
                    type: "increments",
                    attributes: {
                        editable: 1,
                    },
                }),
                expect.objectContaining({
                    name: TABLE_TWO.COLUMN3.name,
                    attributes: {
                        editable: 1,
                    },
                }),
                expect.objectContaining({
                    name: TABLE_TWO.COLUMN4.name,
                    attributes: {
                        editable,
                    },
                }),
            ])
        )
        expect(data.rows.length).toBe(1)
        expect(data.rows[0]).toEqual(
            expect.objectContaining({
                [m.ID]: 1,
                column3: "data1",
                column4: "data2",
            })
        )
    })
})

describe("Get table info", () => {
    test("Get table metadata without rows", async () => {
        const data = (await core.events.request(
            getTableInfo(DB_CONN_ID, TABLE_TWO.id)
        )) as any
        expect(data).toHaveProperty("table")
        expect(data).toHaveProperty("columns")
        expect(data).not.toHaveProperty("rows")
        expect(data.table).toEqual(
            expect.objectContaining({
                id: expect.anything(),
                name: expect.anything(),
                key: expect.anything(),
            })
        )
    })
})

describe("Get actual table data", () => {
    beforeEach(setup)

    test("Get actual table data including meta data", async () => {
        const attributes = ["editable"]
        const data = (await core.events.request(
            getTableData(DB_CONN_ID, TABLE_TWO.id, attributes)
        )) as TableData<Row>

        expect(data).toEqual({
            table: {
                id: TABLE_TWO.id,
                key: `p${PROJECT_ONE.id}_${TABLE_TWO.name}`,
                name: TABLE_TWO.name,
            },
            columns: [
                expect.objectContaining({
                    name: TABLE_TWO.COLUMN0.name,
                    type: "increments",
                    attributes: {
                        editable: 1,
                    },
                }),
                expect.objectContaining({
                    name: "column3",
                    type: "string",
                    attributes: {
                        editable: 1,
                    },
                }),
                expect.objectContaining({
                    name: "column4",
                    type: "string",
                    attributes: {
                        editable: 1,
                    },
                }),
            ],
            rows: [{ [m.ID]: 1, column3: "data1", column4: "data2" }],
        })
    })
})

describe("Get info for one column", () => {
    const COLUMN = TABLE_TWO.COLUMN3
    beforeEach(setup)
    test("Get a single column's column descriptor", async () => {
        const column = (await core.events.request(
            getColumnInfo(DB_CONN_ID, COLUMN.id)
        )) as ColumnDescriptor
        expect(column).toEqual(expect.objectContaining(COLUMN))
    })
})

async function setup_copy() {
    await setup()

    // empty tables
    await core.events.request(deleteRow(DB_CONN_ID, TABLE_TWO.key, []))

    // create columns with shared name
    await core.events.request(
        changeColumnName(
            DB_CONN_ID,
            TABLE_ONE.COLUMN2.id,
            TABLE_TWO.COLUMN4.name
        )
    )

    // fill with some dummy data
    for (const i in [1, 2, 3]) {
        await core.events.request(
            insert(DB_CONN_ID, TABLE_TWO.key, {
                [TABLE_TWO.COLUMN3.name]: "table2_column3_" + i,
                [TABLE_TWO.COLUMN4.name]: "table2_column4_" + i,
            })
        )

        await core.events.request(
            insert(DB_CONN_ID, TABLE_ONE.key, {
                [TABLE_ONE.COLUMN1.name]: "table1_column1_" + i,
                [TABLE_TWO.COLUMN4.name]: "table1_column2_" + i,
            })
        )
    }

    //insert duplicate column
    await core.events.request(
        insert(DB_CONN_ID, TABLE_TWO.key, {
            [TABLE_TWO.COLUMN3.name]: "duplicate_3",
            [TABLE_TWO.COLUMN4.name]: "duplicate_4",
        })
    )

    await core.events.request(
        insert(DB_CONN_ID, TABLE_ONE.key, {
            [TABLE_ONE.COLUMN1.name]: "duplicate_1",
            [TABLE_TWO.COLUMN4.name]: "duplicate_4",
        })
    )
}

describe("Merge Tables, column options", () => {
    beforeEach(setup_copy)

    it("test error handling column", async () => {
        try {
            await core.events.request(
                merge(
                    DB_CONN_ID,
                    TABLE_TWO.id,
                    TABLE_ONE.id,
                    "nonexisting option"
                )
            )
            expect(true).toBe(false)
        } catch (e) {
            expect((e as Error).message).toBe(
                "nonexisting option is not a valid column option"
            )
        }
    })

    it("test merging default", async () => {
        await core.events.request(merge(DB_CONN_ID, TABLE_TWO.id, TABLE_ONE.id))

        let rowsQuery = (await core.events.request(
            select(DB_CONN_ID, TABLE_ONE.key)
        )) as any[]

        expect(rowsQuery).toEqual([
            {
                _id: 1,
                column1: "table1_column1_0",
                column4: "table1_column2_0",
            },
            {
                _id: 2,
                column1: "table1_column1_1",
                column4: "table1_column2_1",
            },
            {
                _id: 3,
                column1: "table1_column1_2",
                column4: "table1_column2_2",
            },
            { _id: 4, column1: "duplicate_1", column4: "duplicate_4" },
            { _id: 5, column1: null, column4: "table2_column4_0" },
            { _id: 6, column1: null, column4: "table2_column4_1" },
            { _id: 7, column1: null, column4: "table2_column4_2" },
            { _id: 8, column1: null, column4: "duplicate_4" },
        ])
    })

    it("test merge intersection", async () => {
        await core.events.request(
            merge(DB_CONN_ID, TABLE_TWO.id, TABLE_ONE.id, "intersection")
        )

        let rowsQuery = (await core.events.request(
            select(DB_CONN_ID, TABLE_ONE.key)
        )) as any[]

        expect(rowsQuery).toEqual([
            { _id: 1, column4: "table1_column2_0" },
            { _id: 2, column4: "table1_column2_1" },
            { _id: 3, column4: "table1_column2_2" },
            { _id: 4, column4: "duplicate_4" },
            { _id: 5, column4: "table2_column4_0" },
            { _id: 6, column4: "table2_column4_1" },
            { _id: 7, column4: "table2_column4_2" },
            { _id: 8, column4: "duplicate_4" },
        ])
    })

    it("test merge target", async () => {
        await core.events.request(
            merge(DB_CONN_ID, TABLE_TWO.id, TABLE_ONE.id, "target")
        )

        let rowsQuery = (await core.events.request(
            select(DB_CONN_ID, TABLE_ONE.key)
        )) as any[]

        expect(rowsQuery).toEqual([
            {
                _id: 1,
                column1: "table1_column1_0",
                column4: "table1_column2_0",
            },
            {
                _id: 2,
                column1: "table1_column1_1",
                column4: "table1_column2_1",
            },
            {
                _id: 3,
                column1: "table1_column1_2",
                column4: "table1_column2_2",
            },
            { _id: 4, column1: "duplicate_1", column4: "duplicate_4" },
            { _id: 5, column1: null, column4: "table2_column4_0" },
            { _id: 6, column1: null, column4: "table2_column4_1" },
            { _id: 7, column1: null, column4: "table2_column4_2" },
            { _id: 8, column1: null, column4: "duplicate_4" },
        ])
    })

    it("test merge union", async () => {
        await core.events.request(
            merge(DB_CONN_ID, TABLE_TWO.id, TABLE_ONE.id, "union")
        )

        let rowsQuery = (await core.events.request(
            select(DB_CONN_ID, TABLE_ONE.key)
        )) as any[]

        expect(rowsQuery).toEqual([
            {
                _id: 1,
                column1: "table1_column1_0",
                column4: "table1_column2_0",
                column3: null,
            },
            {
                _id: 2,
                column1: "table1_column1_1",
                column4: "table1_column2_1",
                column3: null,
            },
            {
                _id: 3,
                column1: "table1_column1_2",
                column4: "table1_column2_2",
                column3: null,
            },
            {
                _id: 4,
                column1: "duplicate_1",
                column4: "duplicate_4",
                column3: null,
            },
            {
                _id: 5,
                column1: null,
                column4: "table2_column4_0",
                column3: "table2_column3_0",
            },
            {
                _id: 6,
                column1: null,
                column4: "table2_column4_1",
                column3: "table2_column3_1",
            },
            {
                _id: 7,
                column1: null,
                column4: "table2_column4_2",
                column3: "table2_column3_2",
            },
            {
                _id: 8,
                column1: null,
                column4: "duplicate_4",
                column3: "duplicate_3",
            },
        ])
    })
})

describe("Merge Tables, row options", () => {
    beforeEach(setup_copy)

    it("test error handling row", async () => {
        try {
            await core.events.request(
                merge(
                    DB_CONN_ID,
                    TABLE_TWO.id,
                    TABLE_ONE.id,
                    "",
                    "nonexisting option"
                )
            )
            expect(true).toBe(false)
        } catch (e) {
            expect((e as Error).message).toBe(
                "nonexisting option is not a valid row option"
            )
        }
    })

    it("test merge ignore duplicates", async () => {
        await core.events.request(
            merge(DB_CONN_ID, TABLE_TWO.id, TABLE_ONE.id, "target", "ignore")
        )

        let rowsQuery = (await core.events.request(
            select(DB_CONN_ID, TABLE_ONE.key)
        )) as any[]

        expect(rowsQuery).toEqual([
            {
                _id: 1,
                column1: "table1_column1_0",
                column4: "table1_column2_0",
            },
            {
                _id: 2,
                column1: "table1_column1_1",
                column4: "table1_column2_1",
            },
            {
                _id: 3,
                column1: "table1_column1_2",
                column4: "table1_column2_2",
            },
            { _id: 4, column1: "duplicate_1", column4: "duplicate_4" },
            { _id: 5, column1: null, column4: "table2_column4_0" },
            { _id: 6, column1: null, column4: "table2_column4_1" },
            { _id: 7, column1: null, column4: "table2_column4_2" },
        ])
    })

    it("test merge expand duplicates", async () => {
        await core.events.request(
            merge(DB_CONN_ID, TABLE_TWO.id, TABLE_ONE.id, "union", "expand")
        )

        let rowsQuery = (await core.events.request(
            select(DB_CONN_ID, TABLE_ONE.key)
        )) as any[]

        expect(rowsQuery).toEqual([
            {
                _id: 1,
                column1: "table1_column1_0",
                column4: "table1_column2_0",
                column3: null,
            },
            {
                _id: 2,
                column1: "table1_column1_1",
                column4: "table1_column2_1",
                column3: null,
            },
            {
                _id: 3,
                column1: "table1_column1_2",
                column4: "table1_column2_2",
                column3: null,
            },
            {
                _id: 5,
                column1: null,
                column4: "table2_column4_0",
                column3: "table2_column3_0",
            },
            {
                _id: 6,
                column1: null,
                column4: "table2_column4_1",
                column3: "table2_column3_1",
            },
            {
                _id: 7,
                column1: null,
                column4: "table2_column4_2",
                column3: "table2_column3_2",
            },
            {
                _id: 4,
                column1: "duplicate_1",
                column4: "duplicate_4",
                column3: "duplicate_3",
            },
        ])
    })
})

describe("Copy Tables", () => {
    beforeEach(setup_copy)

    it("test copy", async () => {
        const target_info = await core.events.request(
            copy(DB_CONN_ID, TABLE_ONE.id, TEST_ROLE_ID, PROJECT_ONE.id)
        )

        const rows_source = (await core.events.request(
            select(DB_CONN_ID, TABLE_ONE.key)
        )) as any[]
        const rows_target = (await core.events.request(
            select(DB_CONN_ID, target_info.key)
        )) as any[]

        expect(rows_source).toEqual(rows_target)
    })
})
