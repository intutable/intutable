import { PluginLoader } from "@intutable-org/core"
import { insert } from "@intutable-org/database/dist/requests"
import {
    getTablesFromProject,
    createTableInProject,
    getColumnsFromTable,
} from "@intutable-org/project-management/dist/requests"
import { PersonData, person_data_table_structure } from "./resources"
import { createTableName } from "../utils/createTableName"
import { fetchPersonData } from "./fetchPersonData"
import { TableDescriptor } from "@intutable-org/lazy-views"

export async function insert_person_data_into_table(
    plugins: PluginLoader,
    connectionId: string,
    role_id: number,
    pid_list: number[],
    project_id: number,
    table_id: number
): Promise<number> {
    //check if there are persons to insert
    if (pid_list.length === 0) {
        throw new Error("no persons to insert")
    }

    const { cols, table_key, table_id_updated } = await createPersonsTable(
        plugins,
        connectionId,
        project_id,
        table_id,
        role_id
    )

    await Promise.all(
        pid_list.map(async (id, index) => {
            let data = {}
            const r = await fetchPersonData(id)

            for (const col of cols) {
                if (Object.keys(r).includes(col.name)) {
                    Object.assign(data, {
                        [col.name.toString()]: r[col.name as keyof PersonData],
                    })
                } else if (!(col.name === "_id")) {
                    Object.assign(data, { [col.name.toString()]: null })
                }
            }
            data = {
                ...data,
                index: index,
            }
            await plugins.events.request(insert(connectionId, table_key, data))
        })
    )

    return table_id_updated
}

async function createPersonsTable(
    plugins: PluginLoader,
    connectionId: string,
    project_id: number,
    table_id: number,
    role_id: number
) {
    let tables_descriptor

    try {
        tables_descriptor = await plugins.events.request(
            getTablesFromProject(connectionId, project_id)
        )
    } catch (error) {
        throw new Error("could not get tables")
    }

    const tables: string[] = []
    let table_exists = false
    for (const table of tables_descriptor) {
        tables.push(table.name)
        if (table.id === table_id) {
            table_exists = true
        }
    }

    if (table_id !== -1 && table_exists === false) {
        throw new Error("Table does not exist")
    }

    //generate new table if no tableName specfied
    if (table_id === -1) {
        let i = 1
        while (tables.includes(createTableName() + " " + i.toString())) {
            i++
        }

        table_id = (
            (await plugins.events.request(
                createTableInProject(
                    connectionId,
                    role_id,
                    project_id,
                    createTableName + " " + i.toString(),
                    person_data_table_structure
                )
            )) as TableDescriptor
        ).id
    }

    //get table info
    tables_descriptor = await plugins.events.request(getTablesFromProject(connectionId, project_id))

    let table_key = ""
    for (const table of tables_descriptor) {
        if (table_id === table.id) {
            table_key = table.key
        }
    }

    //check if name and surname columns exist
    const cols = await plugins.events.request(getColumnsFromTable(connectionId, table_id))

    let surname = false,
        firstname = false

    for (const col of cols) {
        if (col.name === "name") {
            surname = true
        }
        if (col.name === "vorname") {
            firstname = true
        }
    }

    if (!surname) {
        throw new Error("no column 'surname'")
    }
    if (!firstname) {
        throw new Error("no column 'firstname'")
    }
    return { cols, table_key, table_id_updated: table_id }
}
