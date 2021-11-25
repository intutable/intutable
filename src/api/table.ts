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
    const method = "getProjectTables"
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
    authCookie?: string
): Promise<TableData> => {
    const channel = "database"
    const method = "select"
    const body = { table: "members" }
    const cookie = authCookie

    // TODO: implement

    const coreResponse = await coreRequest(channel, method, body, cookie)

    if (!Array.isArray(coreResponse)) return Promise.reject(new Error())

    const rows = coreResponse.map(({ _id, ...values }) => ({
        id: _id,
        ...values,
    }))

    const returnObject: TableData = {
        tableName: "Personen",
        cols: [
            { key: "id", name: "ID" },
            { key: "employeeId", name: "EID" },
            {
                key: "firstName",
                name: "Vorname",
                editable: true,
            },
            {
                key: "lastName",
                name: "Nachname",
                editable: true,
            },
            { key: "description", name: "Description" },
            {
                key: "title",
                name: "Titel",
                editable: true,
            },
            { key: "phone", name: "Test" },
            {
                key: "mail",
                name: "E-Mail",
                editable: true,
            },
        ],
        rows: rows,
    }

    return Promise.resolve(returnObject)
}
