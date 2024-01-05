import { PersonData } from "./scrapers/resources"

const CHANNEL = "web-import"

/**
 * search for persons in LSF having a name and surname
 *
 * @param name - first name of the person to search for
 * @param surname - surname of the person to search for
 * @returns a list of personHandles matching the name and surname
 */
export function listPersonsLSF(name: string, surname: string) {
    return {
        channel: CHANNEL,
        method: "list-persons-lsf",
        name,
        surname,
    }
}

/**
 * fetches a person from LSF by id
 *
 * @param id - id of the person to fetch
 * @returns all kind of information about the person
 */
export function fetchPersonLSF(id: number) {
    return {
        channel: CHANNEL,
        method: "fetch-person-lsf",
        id,
    }
}

/**
 * fetches all persons from "Fakultät für Mathematik und Informatik"
 *
 * @param facultyID : id of the faculty to be fetched
 * @returns a table with persons data
 */
export function fetchFacultyLSF(facultyID: number) {
    return {
        channel: CHANNEL,
        method: "fetch-faculty-lsf",
        faculty_id: facultyID,
    }
}

/**
 * saves person Data into given Table
 *
 * @param connectionID -
 * @param data - personData of persons to insert
 * @param tableName - name of the table persons are to be inserted
 * @returns a table with persons data
 */
export function insertPersonDataIntoTable(
    connectionId: string,
    role_id: number,
    pid_list: number[],
    project_id: number,
    table_id: number
) {
    return {
        channel: CHANNEL,
        method: "insert-person-data-into-table",
        connectionId,
        role_id,
        pid_list,
        project_id,
        table_id,
    }
}

/**
 * saves person Data into given Table
 *
 * @param connectionID -
 * @param data - personData of persons to insert
 * @param role_id - role id
 * @param project_id - id of the project
 * @param table_id - id of the table persons are to be inserted (-1: create new table)
 * @param faculty - name of the requested faculty
 * @returns a table with persons data
 */
export function insertTemporaryDataIntoProject(
    connectionId: string,
    role_id: number,
    pid_list: number[],
    project_id: number,
    table_id: number,
    faculty_id: number
) {
    return {
        channel: CHANNEL,
        method: "insert-temporary-data-into-project",
        connectionId,
        role_id,
        pid_list,
        project_id,
        table_id,
        faculty_id,
    }
}
