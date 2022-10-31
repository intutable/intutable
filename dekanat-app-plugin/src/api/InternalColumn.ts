import { DB } from "shared/src/types"

/**
 * Internal columns are columns that should not be shipped to the frontend
 * but those data should be accessible in the row (just without a corresponding column, e.g. an index or id).
 *
 * Internal columns are identified by `column.isInternal`.
 */
export class InternalColumn {
    /**
     * Writes the values of internal columns into rows
     * without a prefix. Then deletes the Row.
     *
     *
     * #### // TODO
     *
     * Atm only the index and the id columns are internal.
     *
     * One day in the future this process will be automated.
     * For now it's hardcoded.
     *
     * Problems to be solved:
     * • Prefix
     * • which key to choose
     *
     */
    public processInternalColumns(
        columns: DB.Restructured.Column[],
        rows: DB.Row[]
    ): { columns: DB.Restructured.Column[]; rows: DB.Restructured.Row[] } {
        const processedRows: DB.Restructured.Row[] = []
        const nonInternalColumns = columns.map(column => {
            if (column.isInternal) {
                // TODO: automate this process
                if (column.kind === "index") {
                    rows.forEach(row =>
                        processedRows.push({
                            index: row[column.key] as number,
                            ...row,
                        })
                    )
                    return
                }

                if (column.name === "_id") {
                    // TODO: research: where is the id inserted at?
                    return
                }

                throw new Error(
                    `SystemError: Not Implemented (This mechanism is not supported yet).`
                )
            }

            return column
        })

        if (rows.length !== processedRows.length) throw new Error("")

        return {
            columns: nonInternalColumns,
            rows: processedRows,
        }
    }
}
