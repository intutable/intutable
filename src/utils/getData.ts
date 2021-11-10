import type { User } from "./useAuth"
import { Data } from "./useProject"

/**
 * Returns data based on table type.
 * @param {Table} table table type
 * @returns {DataGridDataType} data
 */
export async function getDataForTable() {
    return {
        tableType: "Personen",
        cols: [
            { field: "id", headerName: "ID", description: "Eindeutige ID der Person" },
            { field: "employeeId", headerName: "EID", description: "Test" },
            {
                field: "firstName",
                headerName: "Vorname",
                editable: true,
                description: "Vorname der Person",
            },
            {
                field: "lastName",
                headerName: "Nachname",
                editable: true,
                description: "Nachname der Person",
            },
            { field: "description", headerName: "Description", description: "Test" },
            {
                field: "title",
                headerName: "Titel",
                editable: true,
                description: "Akademischer Titel der Person",
                type: "singleSelect",
                valueOptions: [
                    { value: "doktor", label: "Dr." },
                    { value: "professor", label: "Prof." },
                    { value: "professordoktor", label: "Prof. Dr." },
                ],
            },
            { field: "phone", headerName: "Test", description: "Test" },
            {
                field: "mail",
                headerName: "E-Mail",
                editable: true,
                description: "E-Mail-Adresse der Person",
            },
        ],
        rows: await fetch("http://localhost:8080/request/database/select", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ table: "members" }),
        })
            .then(res => res.json())
            .then(rows => rows.map(({ _id, ...values }) => ({ id: _id, ...values }))),
    }
}

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
export const getDataOfTable = async (table: string): Promise<unknown> => {
    return Promise.resolve()
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
