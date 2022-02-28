// Todo: use returning instead of last-index (database)
// get table key from projman plugin instead of cobbling it together manually
import { inspect } from "util"
import { coreRequest } from "api/utils/coreRequest"
import { Row, PMTypes as PM } from "types"
import type { User } from "auth"
import { CHANNEL } from "api/constants"
import Obj from "types/Obj"

export const updateRow = async (
    user: User,
    project: PM.Project,
    table: PM.Table,
    condition: unknown[],
    update: { [index: string]: unknown }
): Promise<void> => {
    await coreRequest(
        CHANNEL.DATABASE,
        "update",
        {
            table: `p${project.projectId}_${table.tableName}`,
            condition,
            update,
        },
        user.authCookie
    )
}

export const createRow = async (
    user: User,
    project: PM.Project,
    table: PM.Table,
    values: Obj = {}
): Promise<void> => {
    await coreRequest(
        CHANNEL.DATABASE,
        "insert",
        {
            table: `p${project.projectId}_${table.tableName}`,
            values,
        },
        user.authCookie
    )
}

export const deleteRow = async (
    user: User,
    project: PM.Project,
    table: PM.Table,
    condition: unknown[]
): Promise<void> => {
    await coreRequest(
        CHANNEL.DATABASE,
        "deleteRow",
        {
            table: `p${project.projectId}_${table.tableName}`,
            condition,
        },
        user.authCookie
    )
}