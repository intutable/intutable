import path from "path"
import { Core } from "@intutable/core"
import { Column, SimpleColumnOption, ColumnOption, ColumnType } from "../src/types"
import {
    addColumn,
    alterColumn,
    createTable,
    deleteColumn,
    deleteRow,
    deleteTable,
    insert,
    listColumnNames,
    listColumns,
    listTables,
    renameColumn,
    renameTable,
    select,
    update,
    rawQuery,
    openConnection,
    closeConnection,
} from "../src/requests"
import {
    deleteTestTable,
    columnCreationOptions,
    translateTypeAlias,
    clearTestTable,
} from "./test_utils"

const PLUGIN_PATH = path.join(__dirname, "../")

let core: Core

export const TEST_TABLE = "students"
export const TEST_TABLE_COLUMNS: Column[] = [
    { name: "id", type: ColumnType.increments },
    { name: "first_name", type: ColumnType.text },
    { name: "last_name", type: ColumnType.text },
    { name: "age", type: ColumnType.integer },
]

export let DB_CONN_ID: string
export const USERNAME = "admin"
export const PASSWORD = "admin"

const MAX = { first_name: "Max", last_name: "Messer", age: 42 }
const MARIA = { first_name: "Maria", last_name: "Gabel", age: 23 }
const MARKUS = { first_name: "Markus", last_name: "Löffel", age: 23 }

beforeAll(async () => {
    core = await Core.create([PLUGIN_PATH])
    const connection = (await core.events.request(openConnection(USERNAME, PASSWORD))) as any
    DB_CONN_ID = connection.connectionId
})

afterAll(async () => {
    await core.events.request(deleteTable(DB_CONN_ID, TEST_TABLE))

    await core.plugins.closeAll()
})

describe("close connections", () => {
    beforeAll(async () => {
        await deleteTestTable(core)
    })

    test("reject bad login credentials", async () => {
        const connectionPromise = core.events.request(openConnection("foo", "bar"))
        await expect(connectionPromise).rejects.toBeDefined()
    })

    test("close a connection", async () => {
        const open = core.events.request(openConnection(USERNAME, PASSWORD)) as Promise<{
            connectionId: string
        }>
        const newConnId = (await open).connectionId
        // it never throws, this is just to check that it resolves without
        // looking at the value
        await expect(open).resolves.not.toThrow()

        const create = core.events.request(
            createTable(newConnId, TEST_TABLE, [
                {
                    name: "colName",
                    type: ColumnType.text,
                },
            ])
        )
        await expect(create).resolves.not.toThrow()
        await deleteTestTable(core)
        await core.events.request(closeConnection(newConnId))
        const create2 = core.events.request(
            createTable(newConnId, TEST_TABLE, [
                {
                    name: "colName",
                    type: ColumnType.text,
                },
            ])
        )
        await expect(create2).rejects.not.toThrow()
    })
})

describe("can create table", () => {
    beforeEach(async () => {
        await deleteTestTable(core)
    })

    test.each(columnCreationOptions())(
        "can create table with %s %s column",
        async (option: string, type: string) => {
            await core.events.request(
                createTable(DB_CONN_ID, TEST_TABLE, [
                    {
                        name: "colName",
                        type: type as ColumnType,
                        options: [option as ColumnOption],
                    },
                ])
            )

            const tables = await core.events.request(listTables(DB_CONN_ID))

            const columns: any = await core.events.request(listColumns(DB_CONN_ID, TEST_TABLE))

            expect(tables).toContain(TEST_TABLE)
            expect(columns.colName.type).toEqual(translateTypeAlias(type))
        }
    )

    test("can create table with non-nullable text column", async () => {
        await core.events.request(
            createTable(DB_CONN_ID, TEST_TABLE, [
                {
                    name: "colName",
                    type: ColumnType.text,
                    options: [SimpleColumnOption.notNullable],
                },
            ])
        )

        const tables = await core.events.request(listTables(DB_CONN_ID))

        const columns: any = await core.events.request(listColumns(DB_CONN_ID, TEST_TABLE))

        expect(tables).toContain(TEST_TABLE)
        expect(columns.colName.type).toEqual("text")
        expect(columns.colName.nullable).toEqual(false)
    })
})

describe("can manage tables", () => {
    beforeEach(async () => {
        await clearTestTable(core)
    })

    test("can delete table", async () => {
        await core.events.request(deleteTable(DB_CONN_ID, TEST_TABLE))

        const tables = await core.events.request(listTables(DB_CONN_ID))

        expect(tables).not.toContain(TEST_TABLE)
    })

    test("can rename table", async () => {
        const newName = "newTableName"

        await core.events.request(deleteTable(DB_CONN_ID, newName))

        await core.events.request(renameTable(DB_CONN_ID, TEST_TABLE, newName))

        const tables = await core.events.request(listTables(DB_CONN_ID))

        expect(tables).not.toContain(TEST_TABLE)
        expect(tables).toContain(newName)

        await core.events.request(deleteTable(DB_CONN_ID, "newTableName"))
    })
})

describe("can insert data", () => {
    beforeEach(async () => {
        await clearTestTable(core)
    })

    test("can insert data of a single row", async () => {
        const { id } = (await core.events.request(
            insert(DB_CONN_ID, TEST_TABLE, { first_name: "Max", last_name: "Muster", age: 42 }, [
                "id",
            ])
        )) as any

        expect(id).toEqual(1)
    })

    test("can insert data of multiple rows", async () => {
        const { id } = (await core.events.request(
            insert(DB_CONN_ID, TEST_TABLE, [MAX, MARIA, MARKUS], ["id"])
        )) as any

        expect(id).toEqual(3)
    })
})

describe("can select data", () => {
    beforeAll(async () => {
        await clearTestTable(core)
        await core.events.request(insert(DB_CONN_ID, TEST_TABLE, [MAX, MARIA, MARKUS]))
    })

    test("can select everything from table", async () => {
        const result: any = await core.events.request(select(DB_CONN_ID, TEST_TABLE))

        expect(result.map(({ id, ...row }: { id: any }) => row)).toEqual([MAX, MARIA, MARKUS])
    })

    test("can select some columns with optional select", async () => {
        const result: any = await core.events.request(
            select(DB_CONN_ID, TEST_TABLE, { columns: ["first_name", "age"] })
        )

        const expected = [MAX, MARIA, MARKUS].map(({ age, first_name }) => ({
            age,
            first_name,
        }))

        expect(result).toEqual(expected)
    })

    test("can select a single row by id with optional condition", async () => {
        const result = await core.events.request(
            select(DB_CONN_ID, TEST_TABLE, { condition: ["id", 1] })
        )

        expect(result).toEqual([{ ...MAX, id: 1 }])
    })

    test("can select multiple rows by attribute with optional condition", async () => {
        const result = await core.events.request(
            select(DB_CONN_ID, TEST_TABLE, { condition: ["age", 23] })
        )

        expect(result).toEqual([
            { ...MARIA, id: 2 },
            { ...MARKUS, id: 3 },
        ])
    })

    test("can filter by smaller/bigger than condition", async () => {
        const result = (
            (await core.events.request(
                select(DB_CONN_ID, TEST_TABLE, {
                    condition: ["age", "<", "30"],
                    columns: ["age"],
                })
            )) as any[]
        ).map(({ age }) => age)

        expect(result).toEqual([23, 23])
    })

    test("can filter by in condition", async () => {
        const result = (
            (await core.events.request(
                select(DB_CONN_ID, TEST_TABLE, {
                    condition: ["id", "in", [1, 3]],
                })
            )) as any[]
        ).map(({ id }) => id)

        expect(result).toEqual([1, 3])
    })

    test("can filter by string like condition", async () => {
        const result = (
            (await core.events.request(
                select(DB_CONN_ID, TEST_TABLE, {
                    condition: ["first_name", "like", "Mar%"],
                    columns: ["first_name"],
                })
            )) as any[]
        ).map(({ first_name }) => first_name)

        expect(result).toEqual(["Maria", "Markus"])
    })

    test("can filter by negated condition", async () => {
        const result = (
            (await core.events.request(
                select(DB_CONN_ID, TEST_TABLE, {
                    condition: ["not", "id", "1"],
                })
            )) as any[]
        ).map(({ id }) => id)

        expect(result).toEqual([2, 3])
    })
})

describe("can update data", () => {
    beforeEach(async () => {
        await clearTestTable(core)
        await core.events.request(insert(DB_CONN_ID, TEST_TABLE, [MAX, MARIA, MARKUS]))
    })

    test("can update by attribute", async () => {
        await core.events.request(
            update(DB_CONN_ID, TEST_TABLE, {
                condition: ["id", 1],
                update: { first_name: "first" },
            })
        )

        const response = (
            (await core.events.request(
                select(DB_CONN_ID, TEST_TABLE, { columns: ["first_name"] })
            )) as any[]
        ).map(({ first_name }) => first_name)

        expect(response).toEqual(
            expect.arrayContaining([MARIA.first_name, MARKUS.first_name, "first"])
        )
    })

    test("can update by condition", async () => {
        await core.events.request(
            update(DB_CONN_ID, TEST_TABLE, {
                condition: ["age", "<", 30],
                update: { first_name: "young" },
            })
        )

        const response = (
            (await core.events.request(
                select(DB_CONN_ID, TEST_TABLE, { columns: ["first_name"] })
            )) as any[]
        ).map(({ first_name }) => first_name)

        expect(response).toEqual([MAX.first_name, "young", "young"])
    })

    test("can update by negated condition", async () => {
        await core.events.request(
            update(DB_CONN_ID, TEST_TABLE, {
                condition: ["not", "age", "<", "30"],
                update: { first_name: "old" },
            })
        )

        const response = (
            (await core.events.request(
                select(DB_CONN_ID, TEST_TABLE, {
                    columns: ["first_name"],
                })
            )) as any[]
        ).map(({ first_name }) => first_name)

        expect(response).toEqual(
            expect.arrayContaining([MARIA.first_name, MARKUS.first_name, "old"])
        )
    })
})

describe("can delete data", () => {
    beforeAll(async () => {
        await clearTestTable(core)
        await core.events.request(insert(DB_CONN_ID, TEST_TABLE, [MAX, MARIA, MARKUS]))
    })

    test("can delete by id", async () => {
        const request = deleteRow(DB_CONN_ID, TEST_TABLE, ["id", 1])
        await core.events.request(request)

        const response = await core.events.request(
            select(DB_CONN_ID, TEST_TABLE, { condition: ["id", 1] })
        )

        expect(response).toEqual([])
    })

    test("can delete by attribute", async () => {
        await core.events.request(deleteRow(DB_CONN_ID, TEST_TABLE, ["age", 23]))

        const response = await core.events.request(
            select(DB_CONN_ID, TEST_TABLE, { condition: ["age", 23] })
        )

        expect(response).toEqual([])
    })
})

describe("can read database schema", () => {
    const columnNames = ["id", "first_name", "last_name", "age"]

    beforeAll(async () => {
        await clearTestTable(core)
    })

    test("can read column info", async () => {
        const columns = await core.events.request(listColumns(DB_CONN_ID, TEST_TABLE))

        expect(Object.keys(columns)).toEqual(columnNames)
        expect(
            Object.fromEntries(Object.entries(columns).map(([col, info]) => [col, info.type]))
        ).toEqual({
            age: "integer",
            first_name: "text",
            id: "integer",
            last_name: "text",
        })
    })

    test("can read column names", async () => {
        const columns = await core.events.request(listColumnNames(DB_CONN_ID, TEST_TABLE))

        expect(columns).toEqual(columnNames)
    })
})

describe("can alter database schema", () => {
    let columnsBefore: string[]

    beforeEach(async () => {
        await clearTestTable(core)

        columnsBefore = (await core.events.request(listColumnNames(DB_CONN_ID, TEST_TABLE))) as any
    })

    test("can delete columns", async () => {
        await core.events.request(deleteColumn(DB_CONN_ID, TEST_TABLE, "age"))

        const columns = await core.events.request(listColumnNames(DB_CONN_ID, TEST_TABLE))

        expect(columns).toEqual(columnsBefore.filter(c => c !== "age"))
    })

    test("can rename columns", async () => {
        await core.events.request(renameColumn(DB_CONN_ID, TEST_TABLE, "age", "howOld"))

        const columns = await core.events.request(listColumnNames(DB_CONN_ID, TEST_TABLE))
        expect(columns).toEqual(columnsBefore.map(c => (c === "age" ? "howOld" : c)))
    })

    test("can add column", async () => {
        await core.events.request(
            addColumn(DB_CONN_ID, TEST_TABLE, {
                name: "placeOfBirth",
                type: ColumnType.text,
            })
        )

        const columns = await core.events.request(listColumnNames(DB_CONN_ID, TEST_TABLE))

        expect(columns).toEqual([...columnsBefore, "placeOfBirth"])
    })

    test("can change datatype of column", async () => {
        const oldColumns = (await core.events.request(listColumns(DB_CONN_ID, TEST_TABLE))) as any

        await core.events.request(
            alterColumn(DB_CONN_ID, TEST_TABLE, {
                name: "age",
                type: ColumnType.string,
            })
        )

        const columns = (await core.events.request(listColumns(DB_CONN_ID, TEST_TABLE))) as any

        expect(columns.age.type).not.toEqual(oldColumns.age.type)
    })
})

describe("can join tables", () => {
    const OTHER_TEST_TABLE = "marks"

    beforeAll(async () => {
        await clearTestTable(core)
        await core.events.request(insert(DB_CONN_ID, TEST_TABLE, [MARIA, MARKUS, MAX]))

        await core.events.request(deleteTable(DB_CONN_ID, OTHER_TEST_TABLE))
        await core.events.request(
            createTable(DB_CONN_ID, OTHER_TEST_TABLE, [
                { name: "last_name", type: ColumnType.string },
                { name: "points", type: ColumnType.integer },
            ])
        )

        await core.events.request(
            insert(DB_CONN_ID, OTHER_TEST_TABLE, {
                last_name: "Messer",
                points: 12,
            })
        )
        await core.events.request(
            insert(DB_CONN_ID, OTHER_TEST_TABLE, {
                last_name: "Messer",
                points: 4,
            })
        )

        await core.events.request(deleteTable(DB_CONN_ID, "parents"))
        await core.events.request(
            createTable(DB_CONN_ID, "parents", [
                { name: "last_name", type: ColumnType.string },
                { name: "first_name", type: ColumnType.string },
            ])
        )
        await core.events.request(
            insert(DB_CONN_ID, "parents", {
                last_name: "Messer",
                first_name: "Michael",
            })
        )
    })

    test("can join two tables", async () => {
        const result = await core.events.request(
            select(DB_CONN_ID, TEST_TABLE, {
                join: {
                    table: OTHER_TEST_TABLE,
                    on: [`${TEST_TABLE}.last_name`, "=", `${OTHER_TEST_TABLE}.last_name`],
                },
                columns: ["first_name", "points"],
            })
        )

        expect(result).toEqual([
            { first_name: "Max", points: 4 },
            { first_name: "Max", points: 12 },
        ])
    })

    test("can join multiple tables", async () => {
        const result = await core.events.request(
            select(DB_CONN_ID, TEST_TABLE, {
                join: [
                    {
                        table: OTHER_TEST_TABLE,
                        on: [`${TEST_TABLE}.last_name`, "=", `${OTHER_TEST_TABLE}.last_name`],
                    },
                    {
                        table: "parents",
                        on: [`${TEST_TABLE}.last_name`, "=", `parents.last_name`],
                    },
                ],
                columns: [
                    "students.first_name as s_first_name",
                    "parents.first_name as p_first_name",
                    "students.last_name",
                    "points",
                ],
            })
        )

        expect(result).toEqual([
            {
                s_first_name: "Max",
                p_first_name: "Michael",
                last_name: "Messer",
                points: 4,
            },
            {
                s_first_name: "Max",
                p_first_name: "Michael",
                last_name: "Messer",
                points: 12,
            },
        ])

        await core.events.request(deleteTable(DB_CONN_ID, "marks"))
        await core.events.request(deleteTable(DB_CONN_ID, "parents"))
    })
})

describe("raw queries", () => {
    beforeAll(async () => {
        await clearTestTable(core)
        await core.events.request(insert(DB_CONN_ID, TEST_TABLE, [MAX, MARIA, MARKUS]))
    })

    test("can select by raw query", async () => {
        const result: any = await core.events
            .request(rawQuery(DB_CONN_ID, `SELECT * from ${TEST_TABLE};`))
            .then(res => (<any>res).rows)

        expect(result.map(({ id, ...row }: { id: any }) => row)).toEqual([MAX, MARIA, MARKUS])
    })

    test("can select by raw query with bindings", async () => {
        const result: any = await core.events
            .request(
                rawQuery(DB_CONN_ID, {
                    sql: `SELECT * FROM ${TEST_TABLE} WHERE age=?;`,
                    bindings: [23],
                })
            )
            .then(res => (<any>res).rows)

        expect(result.map(({ id, ...row }: { id: any }) => row)).toEqual([MARIA, MARKUS])
    })
})

describe("extended column options", () => {
    const TABLE_NAME = "defaultTestTable"

    afterAll(() => core.events.request(deleteTable(DB_CONN_ID, TABLE_NAME)))

    test("can create a column with a default value", async () => {
        await core.events.request(
            createTable(DB_CONN_ID, TABLE_NAME, [
                { name: "a", type: ColumnType.integer },
                {
                    name: "b",
                    type: ColumnType.integer,
                    options: [{ defaultValue: 343 }],
                },
            ])
        )
        await core.events.request(insert(DB_CONN_ID, TABLE_NAME, { a: 10 }))
        const data = (await core.events.request(select(DB_CONN_ID, TABLE_NAME))) as Array<
            Record<string, unknown>
        >
        expect(data.length).toBe(1)
        expect(data[0]).toEqual(expect.objectContaining({ a: 10, b: 343 }))
    })
})
