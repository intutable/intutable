// This file contains api methods related to tables of projects, e.g. GET POST PUT DELETE

import {
    coreRequest,
    CoreRequestError,
} from "@app/api/endpoints/coreinterface/json"
import type { User } from "@context/AuthContext"
import type { TableData } from "../types"
import { isOfTypeTableData } from "../utils"

/**
 * Fetches a list with the names of the tables of a project.
 * @param {User} user user object.
 * @param {string} project project name.
 * @param {string} authCookie auth cookie. Optional.
 * @returns {Promise<string[]>} list of table names in case of success, otherwise an error object with error description.
 */
export const getListWithTables = async (
    user: User,
    project: string,
    authCookie?: string
): Promise<string[]> => {
    const channel = "project-management"
    const method = "getTablesFromProject"
    const body = { user: user.name, projectName: project }
    const cookie = authCookie

    const coreResponse = await coreRequest(channel, method, body, cookie)

    return Array.isArray(coreResponse) &&
        coreResponse.every(element => typeof element === "string")
        ? Promise.resolve(coreResponse)
        : Promise.reject(new Error())
}

/**
 * Fetches the data of a table.
 * @param table table name.
 * @param authCookie auth cookie. Optional.
 * @returns {TableData} table data in case of success, otherwise an error object with error description.
 */
export const getTableData = async (
    table: string,
    project: string,
    authCookie?: string
): Promise<TableData> => {
    const channel = "project-management"
    const method = "getTableData"
    const body = { projectName: project, tableName: table }
    const cookie = authCookie

    // Type: ServerTableData
    const coreResponse: any = await coreRequest(channel, method, body, cookie)

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
    project: string,
    table: string,
    authCookie?: string
): Promise<void> => {
    const channel = "project-management"
    const method = "createTableInProject"
    const body = { user: user.name, projectName: project, table: table }
    const cookie = authCookie

    await coreRequest(channel, method, body, cookie)
    return Promise.resolve()
}

/**
 *
 * @param user
 * @param project
 * @param table
 * @param authCookie
 * @returns
 */
export const deleteTable = async (
    user: User,
    project: string,
    table: string,
    authCookie?: string
): Promise<void> => {
    const channel = "project-management"
    const method = "removeTableFromProject"
    const body = { projectName: project, table: table }
    const cookie = authCookie

    await coreRequest(channel, method, body, cookie)
    return Promise.resolve()
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
    table: string,
    newTableName: string,
    authCookie?: string
): Promise<void> => {
    const channel = "project-management"
    const method = "changeTableName"
    const body = {
        user: user.name,
        project: project,
        oldName: table,
        newName: newTableName,
    }
    const cookie = authCookie

    await coreRequest(channel, method, body, cookie)
    return Promise.resolve()
}
