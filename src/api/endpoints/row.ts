// Todo: use returning instead of last-index (database)
// get table key from projman plugin instead of cobbling it together manually
import {
    insert,
    update as updateR,
    deleteRow as deleteRowR
} from "@intutable/database/dist/requests"
import { inspect } from "util"
import { coreRequest } from "api/utils/coreRequest"
import { Row, PMTypes as PM } from "types"
import type { User } from "auth"
import Obj from "types/Obj"

export const updateRow = async (
    user: User,
    project: PM.Project,
    table: PM.Table,
    condition: unknown[],
    update: { [index: string]: unknown }
): Promise<void> => {
    await coreRequest(
        updateR(`p${project.id}_${table.name}`, { condition, update }),
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
        insert(`p${project.id}_${table.name}`, values),
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
        deleteRowR(`p${project.id}_${table.name}`, condition),
        user.authCookie
    )
}
