/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file test_data.ts
 * @description description
 * @since 05.10.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */


// Node Modules

// Assets

// CSS

// Components

// Utils / Types / Api
import type { GridColDef, GridColumns, GridRowData, GridValueGetterParams } from "@mui/x-data-grid"
import { Table, DataGridDataType } from "./useTable"

/**
 * Returns data based on table type.
 * @param {Table} table table type
 * @returns {DataGridDataType} data
 */
// export const getDataForTable = (table: Table): DataGridDataType => DATA[table]
export async function getDataForTable() {
    return {
        tableType: "Personen",
        cols: [
            { field: "id", headerName: "ID", description: "Eindeutige ID der Person" },
            { field: "employeeId", headerName: "EID", description: "Test"},
            { field: "firstName", headerName: "Vorname", editable: true, description: "Vorname der Person" },
            { field: "lastName", headerName: "Nachname", editable: true, description: "Nachname der Person" },
            { field: "description", headerName: "Description", description: "Test"},
            // { field: "geschlecht", headerName: "Geschlecht", editable: true, description: "Geschlecht der Person", type: "singleSelect", valueOptions: ["Herr", "Frau", "Divers"] },
            { field: "title", headerName: "Titel", editable: true, description: "Akademischer Titel der Person", type: "singleSelect", valueOptions: [{ value: "doktor", label: "Dr." }, { value: "professor", label: "Prof." }, { value: "professordoktor", label: "Prof. Dr." }] },
            // { field: "stellung", headerName: "Stellung", editable: true, description: "Stellung der Person innerhalb der Fakultät", type: "singleSelect", valueOptions: ["Professor", "FK-Leitung"] },
            // { field: "einrichtung", headerName: "Einrichtung", editable: true, description: "Einrichtung die der Person zugeordnet ist", type: "singleSelect", valueOptions: ["Dekanat", "Mathematisches Institut", "Institut für Informatik", "Institut für Angewandte Mathematik", "Institut für Technische Informatik"] },
            // { field: "abkürzung", headerName: "Abkürzung", editable: true, description: "Abkürzung der Einrichtung die der Person zugeordnet ist", type: "singleSelect", valueOptions: ["FakMathInf", "MI", "IfI", "IAM", "ZITI"] },
            // { field: "leitung", headerName: "Leitung", editable: true, description: "Leitungsfunktion der Person" },
            { field: "phone", headerName: "Test", description: "Test"},
            { field: "mail", headerName: "E-Mail", editable: true, description: "E-Mail-Adresse der Person" },
            // { field: "email2", headerName: "E-Mail 2", editable: true, description: "Zweite E-Mail-Adresse der Person" },
            // { field: "telefon", headerName: "Telefon", editable: true, description: "Telefonnummer der Person" },
            // { field: "raum", headerName: "Raum", editable: true, description: "Raum der Person oder Adresse" },
            // { field: "aktiv", headerName: "Aktiv", editable: true, description: "Gibt an, ob die Person aktiv ist oder im Ruhestand", type: "boolean" },
            // { field: "seit", headerName: "Seit", editable: true, description: "Beschäftigungsbeginn der Person", type: "date" },
            // { field: "bis", headerName: "Bis", editable: true, description: "Beschäftigungsende der Person", type: "date" },
        ],
        rows: await fetch("http://localhost:8080/request/database/select", {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({table: "members"})
            }).then(async (res) => {
                let tmp = await res.json()
                tmp.forEach((val) => {
                    val.id = val._id
                    delete val._id
                });
                return tmp
            }),
}


const columns: GridColDef[] = [
    {
        field: 'id',
        headerName: 'ID',
        width: 90
    },
    {
        field: 'firstName',
        headerName: 'First name',
        width: 150,
        editable: true,
    },
    {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,
        editable: true,
    },
    {
        field: 'age',
        headerName: 'Age',
        type: 'number',
        width: 110,
        editable: true,
    },
    {
        field: 'fullName',
        headerName: 'Full name',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 160,
        valueGetter: (params: GridValueGetterParams) => `${params.getValue(params.id, 'firstName') || ''} ${params.getValue(params.id, 'lastName') || ''}`,
    },
]

}


type DB = {
    [key in Table]: DataGridDataType
}

// TODO: populate DATA