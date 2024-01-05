import path from "path"
import { Core } from "@intutable/core"
import {
    Column,
    SimpleColumnOption,
    ColumnType,
    ForeignKey,
    ForeignKeyUpdateAction,
} from "../src/types"
import * as req from "../src/requests"

const PLUGIN_PATH = path.join(__dirname, "../")

let core: Core

export let DB_CONN_ID: string
export const USERNAME = "admin"
export const PASSWORD = "admin"

beforeAll(async () => {
    core = await Core.create([PLUGIN_PATH])
    const open = await (core.events.request(req.openConnection(USERNAME, PASSWORD)) as Promise<{
        connectionId: string
    }>)
    DB_CONN_ID = open.connectionId
})

afterAll(async () => core.events.request(req.closeConnection(DB_CONN_ID)))

describe("simple foreign keys", () => {
    const REFERENCED_TABLE = "employees"
    const REFERENCED_COLUMNS: Column[] = [
        {
            name: "last_name",
            type: ColumnType.string,
            options: [SimpleColumnOption.unique],
        },
    ]
    const REFERENCED_ROW = { last_name: "Miller" }
    const REFERENCING_ROW = {
        last_name: "Miller",
        department: "Mergers and Acquisitions",
    }
    const REFERENCING_TABLE = "employments"
    const FOREIGN_COLUMNS: Column[] = [
        {
            name: "last_name",
            type: ColumnType.string,
        },
        {
            name: "department",
            type: ColumnType.string,
        },
    ]
    const FK_NAME = "fk_employments_last_name"

    async function setup(fk: ForeignKey): Promise<void> {
        await teardown()
        await core.events.request(req.createTable(DB_CONN_ID, REFERENCED_TABLE, REFERENCED_COLUMNS))
        await core.events.request(
            req.createTable(DB_CONN_ID, REFERENCING_TABLE, FOREIGN_COLUMNS, [fk])
        )
        await core.events.request(req.insert(DB_CONN_ID, REFERENCED_TABLE, REFERENCED_ROW))
        await core.events.request(req.insert(DB_CONN_ID, REFERENCING_TABLE, REFERENCING_ROW))
    }
    async function teardown() {
        await core.events.request(req.deleteTable(DB_CONN_ID, REFERENCING_TABLE))
        await core.events.request(req.deleteTable(DB_CONN_ID, REFERENCED_TABLE))
    }

    afterEach(teardown)

    test("insert with bad foreign key prevented", async () => {
        const simpleFK: ForeignKey = {
            columns: "last_name",
            references: "last_name",
            inTable: REFERENCED_TABLE,
            name: FK_NAME,
        }
        await setup(simpleFK)

        const badInsert = core.events.request(
            req.insert(DB_CONN_ID, REFERENCING_TABLE, {
                last_name: "Bateman",
                department: "Murders and Executions",
            })
        )
        await expect(badInsert).rejects.toThrow()
        expect(await badInsert.catch(e => e)).toEqual(
            expect.objectContaining({
                constraint: FK_NAME,
            })
        )
        const employments = (await core.events.request(
            req.select(DB_CONN_ID, REFERENCING_TABLE)
        )) as Array<Record<string, unknown>>
        expect(employments.length).toBe(1)
        expect(employments[0]).toEqual(
            expect.objectContaining({
                last_name: "Miller",
            })
        )
    })
    test("RESTRICT prevents unsafe update", async () => {
        const restrictFK: ForeignKey = {
            columns: "last_name",
            references: "last_name",
            inTable: REFERENCED_TABLE,
            onUpdate: ForeignKeyUpdateAction.restrict,
            name: FK_NAME,
        }
        await setup(restrictFK)

        const badUpdate = core.events.request(
            req.update(DB_CONN_ID, REFERENCED_TABLE, {
                update: { last_name: "Bateman" },
                condition: ["last_name", "Miller"],
            })
        )
        expect(badUpdate).rejects.toThrow()
        expect(await badUpdate.catch(e => e)).toEqual(
            expect.objectContaining({
                constraint: FK_NAME,
            })
        )
    })
    test("CASCADE updates affected rows automatically", async () => {
        const cascadeFK: ForeignKey = {
            columns: "last_name",
            references: "last_name",
            inTable: REFERENCED_TABLE,
            onUpdate: ForeignKeyUpdateAction.cascade,
            name: FK_NAME,
        }
        await setup(cascadeFK)

        await core.events.request(
            req.update(DB_CONN_ID, REFERENCED_TABLE, {
                update: { last_name: "Bateman" },
                condition: ["last_name", "Miller"],
            })
        )
        const employments = (await core.events.request(
            req.select(DB_CONN_ID, REFERENCING_TABLE)
        )) as Array<Record<string, unknown>>
        expect(employments.length).toBe(1)
        expect(employments[0]).toEqual(
            expect.objectContaining({
                last_name: "Bateman",
            })
        )
    })
})

describe("compound foreign keys", () => {
    const REFERENCED_TABLE = "employees"
    const REFERENCED_COLUMNS: Column[] = [
        {
            name: "last_name",
            type: ColumnType.string,
            options: [SimpleColumnOption.unique],
        },
        {
            name: "first_name",
            type: ColumnType.string,
        },
    ]
    const REFERENCED_ROW = { last_name: "Miller", first_name: "Bob" }
    const REFERENCING_ROW = {
        last_name: "Miller",
        first_name: "Bob",
        department: "Mergers and Acquisitions",
    }
    const REFERENCING_TABLE = "employments"
    const FOREIGN_COLUMNS: Column[] = [
        {
            name: "last_name",
            type: ColumnType.string,
        },
        {
            name: "first_name",
            type: ColumnType.string,
        },
        {
            name: "department",
            type: ColumnType.string,
        },
    ]
    const FK_NAME = "fk_employments_multi"

    async function setup(fk: ForeignKey): Promise<void> {
        await teardown()
        await core.events.request(
            req.createTable(DB_CONN_ID, REFERENCED_TABLE, REFERENCED_COLUMNS, [
                { columns: ["last_name", "first_name"] },
            ])
        )
        await core.events.request(
            req.createTable(DB_CONN_ID, REFERENCING_TABLE, FOREIGN_COLUMNS, [fk])
        )
        await core.events.request(req.insert(DB_CONN_ID, REFERENCED_TABLE, REFERENCED_ROW))
        await core.events.request(req.insert(DB_CONN_ID, REFERENCING_TABLE, REFERENCING_ROW))
    }
    async function teardown() {
        await core.events.request(req.deleteTable(DB_CONN_ID, REFERENCING_TABLE))
        await core.events.request(req.deleteTable(DB_CONN_ID, REFERENCED_TABLE))
    }

    afterEach(teardown)

    test("SET NULL sets both referencing columns null", async () => {
        const multiFK: ForeignKey = {
            columns: ["last_name", "first_name"],
            references: ["last_name", "first_name"],
            inTable: "employees",
            onUpdate: ForeignKeyUpdateAction.setNull,
            name: FK_NAME,
        }
        await setup(multiFK)
        await core.events.request(
            req.update(DB_CONN_ID, REFERENCED_TABLE, {
                update: { first_name: "Jim" },
                condition: ["last_name", "Miller"],
            })
        )
        const referencing = (await core.events.request(
            req.select(DB_CONN_ID, REFERENCING_TABLE)
        )) as Array<Record<string, unknown>>
        expect(referencing.length).toBe(1)
        expect(referencing[0]).toEqual(
            expect.objectContaining({
                ...REFERENCING_ROW,
                first_name: null,
                last_name: null,
            })
        )
    })
})
