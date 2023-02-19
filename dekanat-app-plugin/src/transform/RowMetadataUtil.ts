import { DB, SerializedColumn, UnorderedListCellContent } from "shared/dist/types"

export class RowMetadataUtil {
    public applyMetadataToRows(
        columns: SerializedColumn[],
        rows: DB.Restructured.Row[]
    ): DB.Restructured.Row[] {
        let processedRows = rows
        columns.forEach(column => {
            if (column.kind === "backwardLink" || column.kind === "backwardLookup") {
                // backward links and lookups contain arrays of data.
                // Here, we add the info about the items' type.
                processedRows = processedRows.map(row => ({
                    ...row,
                    [column.key]: {
                        items: row[column.key] as UnorderedListCellContent["items"],
                        format: { cellType: column.cellTypeParameter },
                    },
                }))
            }
        })
        return processedRows
    }
}

export const rowMetadataUtil = new RowMetadataUtil()
