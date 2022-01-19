// This file contains api methods related to tables of projects, e.g. GET POST PUT DELETE

import {
    coreRequest,
    CoreRequestError,
} from "@app/api/endpoints/coreinterface/json"
import type { User } from "@context/AuthContext"
import type { TableData } from "../types"
import { isOfTypeTableData } from "../utils"

const channel = "project-management"

/**
 * Fetches a list with the names of the tables of a project.
 * @param {User} user user object.
 * @param {string} projectName project name.
 * @param {string} authCookie auth cookie. Optional.
 * @returns {Promise<string[]>} list of table names in case of success, otherwise an error object with error description.
 */
export const getListWithTables = async (
    user: User,
    projectName: string
): Promise<string[]> => {
    const coreResponse = await coreRequest(
        channel,
        "getTablesFromProject",
        { user: user.name, projectName },
        user.cookie
    )

    return Array.isArray(coreResponse) &&
        coreResponse.every(element => typeof element === "string")
        ? Promise.resolve(coreResponse)
        : Promise.reject(new Error())
}

/**
 * Fetches the data of a table.
 * @param tableName table name.
 * @param authCookie auth cookie. Optional.
 * @returns {TableData} table data in case of success, otherwise an error object with error description.
 */
export const getTableData = async (
    user: User,
    tableName: string,
    projectName: string
): Promise<TableData> => {
    // TODO: set type: ServerTableData
    const coreResponse: any = await coreRequest(
        channel,
        "getTableData",
        { projectName, tableName },
        user.cookie
    )

    coreResponse.columns.map((item: any) => {
        item.key = item.columnName
        item.name = item.key
        delete item.columnName
        return item
    })

    return Promise.resolve(coreResponse as TableData)
}
/*
 * Adds a table to a project.
 * // TODO: implement
 * @param user
 * @param table
 * @param authCookie
 * @returns
 */
export const addTable = async (
    user: User,
    projectName: string,
    table: string
) => {
    await coreRequest(
        channel,
        "createTableInProject",
        { user: user.name, projectName, table },
        user.cookie
    )
}

/**
 *
 * @param user
 * @param projectName
 * @param table
 * @param authCookie
 * @returns
 */
export const deleteTable = async (
    user: User,
    projectName: string,
    table: string
) => {
    await coreRequest(
        channel,
        "removeTableFromProject",
        { projectName, table },
        user.cookie
    )
}

/**
 *
 * @param user
 * @param project
 * @param newProject
 * @param authCookie
 * @returns
 */
export const renameTable = async (
    user: User,
    project: string,
    oldName: string,
    newName: string
) => {
    await coreRequest(
        channel,
        "changeTableName",
        {
            user: user.name,
            project,
            oldName,
            newName,
        },
        user.cookie
    )
}
