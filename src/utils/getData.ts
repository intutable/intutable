import { Column, Row } from "react-data-grid"

import type { User } from "@context/AuthContext"
import { getCoreUrl } from "@app/backend/runtimeconfig"
import { coreRequest } from "@utils/coreinterface"

/**
 * Fetches a List of Projects and its Tables
 * // TODO: implement w/ user auth
 * @param args placeholder for params implemented in future
 */
export const getProjects = async (
    user: User,
    authCookie?: string
): Promise<Array<string>> => {
    return coreRequest(
        "project-management",
        "getProjects",
        { user: user.name },
        authCookie
    )
}

export const getTablesOfProject = async (
    user: User,
    project: string,
    authCookie?: string
): Promise<Array<string>> => {
    return coreRequest(
        "project-management",
        "getProjectTables",
        { user: user.name, projectName: project },
        authCookie
    )
}

export type TableData = {
    tableName: string
    cols: Array<Column<string, unknown>>
    rows: Array<Record<string, unknown>>
}

export const getDataOfTable = async (
    table: string,
    authCookie?: string
): Promise<TableData> => {
    const rowsData = await coreRequest(
        "database",
        "select",
        { table: "members" },
        authCookie
    ).then(rows => rows.map(({ _id, ...values }) => ({ id: _id, ...values })))

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
        rows: rowsData,
    }

    return Promise.resolve(returnObject)
}
