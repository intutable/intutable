import { Core } from "@intutable-org/core"

import { ColumnType, SimpleColumnOption as CO } from "@intutable-org/database/dist/types"
import {
    removeTable,
    createTableInProject,
    getColumnsFromTable,
} from "@intutable-org/project-management/dist/requests"

import type { TableDescriptor, PM_Column, ColumnSpecifier, RowOptions } from "../src/types"

export const EMPTY_ROW_OPTIONS: RowOptions = {
    conditions: [],
    groupColumns: [],
    sortColumns: [],
}

/** This library works all inside one project, so we can just fix this at 1. */
export const PROJECT_ID = 1

/**
 * Our (main) test table: A table of employees, each with a unique ID `_id`,
 * a name `name` (first and last), a `department` (text), `salary_month`
 * monthly salary and `salary_2021`, their salary in 2021 (used for the
 * tests of WHERE functionality)
 */
export const TEST_TABLE_COLUMNS = [
    {
        name: "_id",
        type: ColumnType.increments,
        options: [CO.notNullable, CO.primary],
    },
    {
        name: "name",
        type: ColumnType.text,
        options: [CO.notNullable],
    },
    {
        name: "department",
        type: ColumnType.text,
        options: [CO.notNullable],
    },
    {
        name: "salary_month",
        type: ColumnType.integer,
        options: [CO.notNullable],
    },
]

/**
 * Create the test table and return its metadata in a convenient object.
 */
export async function setupTestTable(
    sessionID: string,
    core: Core,
    testTableName: string,
    ownerId: number
): Promise<{ tableId: number; columns: ColumnSpecifier[] }> {
    const testTable = (await core.events.request(
        createTableInProject(sessionID, ownerId, PROJECT_ID, testTableName, TEST_TABLE_COLUMNS)
    )) as TableDescriptor
    const tableId = testTable.id

    const columns = (await core.events.request(
        getColumnsFromTable(sessionID, tableId)
    )) as PM_Column[]

    return {
        tableId,
        columns: columns.map(c => ({ parentColumnId: c.id, attributes: {} })),
    }
}

export async function deleteTestTable(sessionID: string, core: Core, tableId: number) {
    return core.events.request(removeTable(sessionID, tableId))
}
