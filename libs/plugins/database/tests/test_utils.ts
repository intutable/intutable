import { Core } from "@intutable-org/core"
import { ColumnType } from "../src/types"
import { createTable, deleteTable } from "../src/requests"
import { TEST_TABLE, TEST_TABLE_COLUMNS, DB_CONN_ID } from "./database.test"

export async function clearTestTable(core: Core) {
    await deleteTestTable(core)
    await createTestTable(core)
}
export async function deleteTestTable(core: Core) {
    await core.events.request(deleteTable(DB_CONN_ID, TEST_TABLE))
}

export async function createTestTable(core: Core) {
    await core.events.request(createTable(DB_CONN_ID, TEST_TABLE, TEST_TABLE_COLUMNS))
}
export function columnCreationOptions() {
    const result = []

    Object.keys(ColumnType).forEach(type => {
        ;["nullable", "notNullable", "index", "primary"].forEach(option => {
            result.push([option, type])
        })
    })

    result.push(["unsigned", "integer"])

    return result
}
export function translateTypeAlias(type: string): string {
    const typeAliases = {
        increments: "integer",
        datetime: "timestamp with time zone",
        time: "time without time zone",
        uuid: "uuid",
        binary: "bytea",
        float: "real",
        decimal: "numeric",
        string: "character varying",
        bigInteger: "bigint",
    } as any

    if (type in typeAliases) {
        return typeAliases[type]
    } else {
        return type
    }
}
