import { PluginLoader, CoreRequest, CoreResponse } from "@intutable-org/core"
import { searchPerson } from "./scrapers/searchPerson"
import { fetchPersonsInFaculty } from "./scrapers/fetchPersonsInFaculty"
import { fetchPersonData } from "./scrapers/fetchPersonData"

import { insert_person_data_into_table } from "./scrapers/CRUD"

let plugins: PluginLoader

export async function init(pluginInput: PluginLoader) {
    plugins = pluginInput

    plugins
        .listenForRequests("web-import")
        .on("list-persons-lsf", listPersonsLSF)
        .on("fetch-person-lsf", fetchPersonLSF)
        .on("fetch-faculty-lsf", fetchFacultyLSF)
        .on("insert-person-data-into-table", insertPersonDataIntoTable)
}

// TODO; do not catch the errors and only return the message, instead return the whole object but serialized

async function listPersonsLSF({ name, surname }: CoreRequest): Promise<CoreResponse> {
    try {
        return await searchPerson(name, surname)
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message }
        }
    }
}

async function fetchPersonLSF({ id }: CoreRequest): Promise<CoreResponse> {
    try {
        return await fetchPersonData(id)
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message }
        }
    }
}

async function fetchFacultyLSF({ faculty_id }: CoreRequest): Promise<CoreResponse> {
    try {
        return await fetchPersonsInFaculty(faculty_id)
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message }
        }
    }
}

async function insertPersonDataIntoTable({
    connectionId,
    role_id,
    pid_list,
    project_id,
    table_id,
}: CoreRequest): Promise<CoreResponse> {
    try {
        return await insert_person_data_into_table(
            plugins,
            connectionId,
            role_id,
            pid_list,
            project_id,
            table_id
        )
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message }
        }
    }
}
