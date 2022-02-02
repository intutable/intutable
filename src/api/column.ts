import { coreRequest } from "@app/api/coreinterface/json"
import type { CurrentUser } from "@context/AuthContext"
import { Server } from "http"
import { CHANNEL, ServerColumn, TableId } from "."
import { ColumnList, ColumnId, ColumnName } from "./API_Types"

export const getColumnsFromTable = async (
    user: CurrentUser,
    tableId: TableId
): Promise<ColumnList> => {
    const coreResponse = await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getColumnsFromTable.name,
        { tableId },
        user.authCookie
    )

    if (Array.isArray(coreResponse) === false)
        return Promise.reject(new Error("Expected an Array!"))

    return Promise.resolve(coreResponse as ColumnList)
}

export const createColumnInTable = async (
    user: CurrentUser,
    tableId: TableId,
    columnName: ColumnName
): Promise<void> => {
    const coreResponse = await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        createColumnInTable.name,
        { tableId, columnName },
        user.authCookie
    )

    return Promise.resolve()
}

export const changeColumnName = async (
    user: CurrentUser,
    columnId: ColumnId,
    newName: ColumnName
): Promise<void> => {
    const coreResponse = await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        changeColumnName.name,
        { columnId, newName },
        user.authCookie
    )

    return Promise.resolve()
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
    columnId: ColumnId
): Promise<void> => {
    const coreResponse = await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        removeColumn.name,
        { columnId },
        user.authCookie
    )

    return Promise.resolve()
}
