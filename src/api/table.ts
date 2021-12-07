// This file contains api methods related to tables of projects, e.g. GET POST PUT DELETE

import { coreRequest } from "@utils/coreinterface/json"
import type { User } from "@context/AuthContext"
import type { Column } from "react-data-grid"

/**
 * Fetches a list with the names of the tables of a project.
 * @param {User} user user object.
 * @param {string} project project name.
 * @param {string} authCookie auth cookie. Optional.
 * @returns {Promise<Array<string>>} list of table names in case of success, otherwise an error object with error description.
 */
export const getListWithTables = async (
    user: User,
    project: string,
    authCookie?: string
): Promise<Array<string>> => {
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
 * Defines the type of a table.
 */
export type TableData = {
    tableName: string
    cols: Array<Column<string, unknown>>
    rows: Array<Record<string, unknown>>
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
    
    const coreResponse: unknown = await coreRequest(channel, method, body, cookie) as Omit<TableData, "tableName">
    
    if ("cols" in coreResponse && "rows" in coreResponse) {
        const _coreResponse = coreResponse as Partial<Omit<TableData, "tableName">>
        if (_coreResponse.cols.length > )
    }

    const returnObject: TableData = {
        tableName: project,
        cols: coreResponse.cols,
        rows: coreResponse.rows
    }
    return Promise.resolve(returnObject)
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
): Promise<true> => {
    const channel = "project-management"
    const method = "addTableToProject"
    const body = { user: user.name, projectName: project, table: table }
    const cookie = authCookie

    const coreResponse = await coreRequest(channel, method, body, cookie)

    return Promise.resolve(true)
}
