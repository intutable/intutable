import { coreRequest } from "@app/api/coreinterface/coreRequest"
import type { CurrentUser } from "@context/AuthContext"
import { Server } from "http"
import { CHANNEL, SerializedColumn } from ".."
import { ProjectManagement as PM } from "../Type Annotations/ProjectManagement"

export const getColumnsFromTable = async (
    user: CurrentUser,
    tableId: PM.Table.ID
): Promise<PM.Column.List> => {
    const coreResponse = await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getColumnsFromTable.name,
        { tableId },
        user.authCookie
    )

    if (Array.isArray(coreResponse) === false)
        throw new Error("Expected an Array!")

    return coreResponse as PM.Column.List
}

export const createColumnInTable = async (
    user: CurrentUser,
    tableId: PM.Table.ID,
    columnName: PM.Column.Name
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        createColumnInTable.name,
        { tableId, columnName },
        user.authCookie
    )
}

export const changeColumnName = async (
    user: CurrentUser,
    columnId: PM.Column.ID,
    newName: PM.Column.Name
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        changeColumnName.name,
        { columnId, newName },
        user.authCookie
    )
}

// export const changeColumnAttributes = async (
//     user: CurrentUser,
//     columnId: ColumnId,
//     attributes: [keyof ServerColumn, unknown]
// ): Promise<void> => {
//     const coreResponse = await coreRequest(
//         CHANNEL.PROJECT_MANAGEMENT,
//         changeColumnAttributes.name,
//         { columnId, attributes: [attributes] },
//         user.authCookie
//     )

//     // TODO: parse if value has correct type

//     return Promise.resolve()
// }

export const removeColumn = async (
    user: CurrentUser,
    columnId: PM.Column.ID
): Promise<void> => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        removeColumn.name,
        { columnId },
        user.authCookie
    )
}
