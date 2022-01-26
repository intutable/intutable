import { inspect } from "util"
import { coreRequest, CoreRequestError } from "@app/api/coreinterface/json"
import type { User } from "@context/AuthContext"
import type { Row, ServerColumn, ServerTableData, TableData } from "./types"
import { CHANNEL } from "."

/**
 * Fetches a list with the names of the tables of a project.
 * @param {User} user user object.
 * @param {string} projectName project name.
 * @param {string} authCookie auth cookie. Optional.
 * @returns {Promise<string[]>} list of table names in case of success, otherwise an error object with error description.
 */
export const getTablesFromProject = async (
    user: User,
    projectName: string
): Promise<string[]> => {
    const coreResponse = (await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getTablesFromProject.name,
        { user: user.name, projectName },
        user.cookie
    )) as unknown

    if (typeof coreResponse === "string" && coreResponse.length > 0)
        return Promise.resolve([coreResponse])

    if (Array.isArray(coreResponse)) {
        const parsed = coreResponse.filter(
            t => typeof t === "string" && t.length > 0
        )
        if (parsed.length !== coreResponse.length)
            console.log(
                new RangeError(
                    `Could not parse the response! At least one table could not be read! Response: '${inspect(
                        coreResponse,
                        { depth: null }
                    )}'`
                )
            )
        return Promise.resolve(parsed)
    }

    return Promise.reject(new Error("Could not parse the response!"))
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
): Promise<ServerTableData> => {
    const coreResponse = (await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        getTableData.name,
        { projectName, tableName },
        user.cookie
    )) as ServerTableData

    // TODO: DEV ONLY needed to transform malformed backend data (obsolete with v4)
    const columns = coreResponse.columns.map((item: any) => {
        item.key = item.columnName as string
        item.name = item.key as string
        item.editable = Boolean(item.editable)
        item.editor = "string"
        delete item.columnName
        return item
    })

    const table: ServerTableData = {
        ...coreResponse,
        columns,
    }

    return Promise.resolve(table)
}
/*
 * Adds a table to a project.
 * // TODO: implement
 * @param user
 * @param table
 * @param authCookie
 * @returns
 */
export const createTableInProject = async (
    user: User,
    projectName: string,
    table: string
) => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        createTableInProject.name,
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
export const removeTableFromProject = async (
    user: User,
    projectName: string,
    table: string
) => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        removeTableFromProject.name,
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
export const changeTableName = async (
    user: User,
    project: string,
    oldName: string,
    newName: string
) => {
    await coreRequest(
        CHANNEL.PROJECT_MANAGEMENT,
        changeTableName.name,
        {
            user: user.name,
            project,
            oldName,
            newName,
        },
        user.cookie
    )
}
