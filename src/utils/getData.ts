import { Column, Row } from "react-data-grid"
import type { User } from "./useAuth"
import { Data } from "./useProject"

/**
 * Fetches a List of Projects and its Tables
 * // TODO: implement w/ user auth
 * @param args placeholder for params implemented in future
 */
export const getProjects = async (user: User): Promise<Array<string>> => {
    const projects = await fetch("http://localhost:8080/request/project-management/getProjects", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: user.name }),
    })
    return await projects.json()
}

export const getTablesOfProject = async (user: User, project: string): Promise<Array<string>> => {
    const projects = await fetch(
        "http://localhost:8080/request/project-management/getProjectTables",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: user.name, projectName: project }),
        }
    )
    return await projects.json()
}

export type TableData = {
    tableName: string,
    cols: Array<Column<string, unknown>>,
    rows: any
}
export const getDataOfTable = async (table: string): Promise<TableData> => {
    // TODO: implement
    const rowsData = await fetch("http://localhost:8080/request/database/select", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ table: "members" }),
    })
        .then(res => res.json())
        .then(rows => rows.map(({ _id, ...values }) => ({ id: _id, ...values })))

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
            { key: "description", name: "Description"},
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
        rows: rowsData
    }
    
    return Promise.resolve(returnObject)
}

type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never
export const getAllProjectsWithTables = async (user: User): Promise<Data> => {
    const projects = await getProjects(user)

    const returnObject = projects.map(async proj => {
        const tables = await getTablesOfProject(user, proj)
        return { project: proj, tables: tables } as ArrayElement<Data>
    })

    return Promise.all(returnObject)
}
