// Todo: use returning instead of last-index (database)
// get table key from projman plugin instead of cobbling it together manually
import { inspect } from "util"
import { coreRequest } from "@app/api/utils/coreRequest"
import { SerializedRow } from "@app/types/types"
import type { CurrentUser } from "@context/AuthContext"
import { CHANNEL, ProjectManagement as PM } from "../utils"
import {} from "../utils/ProjectManagement_TypeAnnotations"
import Obj from "@app/utils/Obj"

export const updateRow = async (
    user: CurrentUser,
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
    user: CurrentUser,
    project: PM.Project,
    table: PM.Table,
    values: Obj = {}
): Promise<SerializedRow> => {
    await coreRequest(
        CHANNEL.DATABASE,
        "insert",
        {
            table: `p${project.projectId}_${table.tableName}`,
            values,
        },
        user.authCookie
    )
    const rows = (await coreRequest(
        CHANNEL.DATABASE,
        "select",
        {
            table: `p${project.projectId}_${table.tableName}`,
        },
        user.authCookie
    )) as PM.DBFormat.Table["rows"]

    const newRow = rows[rows.length - 1]
    if (Object.prototype.hasOwnProperty.call(newRow, "_id") === false) {
        throw new TypeError(
            `Received row missing uid: ${inspect(newRow, { depth: null })}`
        )
    }
    return newRow as SerializedRow
}

export const deleteRow = async (
    user: CurrentUser,
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
