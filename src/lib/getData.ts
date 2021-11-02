// Utils / Types / Api
import { Table, DataGridDataType } from "./useTable"

/**
 * Returns data based on table type.
 * @param {Table} table table type
 * @returns {DataGridDataType} data
 */
export async function getDataForTable() {
    return {
        tableType: "Personen",
        cols: [
            { field: "id", headerName: "ID",
              description: "Eindeutige ID der Person" },
            { field: "employeeId", headerName: "EID", description: "Test"},
            { field: "firstName", headerName: "Vorname", editable: true,
              description: "Vorname der Person" },
            { field: "lastName", headerName: "Nachname", editable: true,
              description: "Nachname der Person" },
            { field: "description", headerName: "Description",
              description: "Test"},
            { field: "title", headerName: "Titel", editable: true,
              description: "Akademischer Titel der Person",
              type: "singleSelect",
              valueOptions: [
                  { value: "doktor", label: "Dr." },
                  { value: "professor", label: "Prof." },
                  { value: "professordoktor", label: "Prof. Dr." }
              ]},
            { field: "phone", headerName: "Test", description: "Test"},
            { field: "mail", headerName: "E-Mail", editable: true,
              description: "E-Mail-Adresse der Person" },
        ],
        rows: await fetch("http://localhost:8080/request/database/select",
                          { method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json' },
                            body: JSON.stringify({table: "members"})})
            .then((res) => res.json())
            .then(rows => rows.map(({ _id, ...values }) =>
                ({ id: _id, ...values })))
    }
}
