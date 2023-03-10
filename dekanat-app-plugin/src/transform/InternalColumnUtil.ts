import { DB } from "shared/dist/types"
import { inspect } from "util"

/**
 * Internal columns are columns that should not be shipped to the frontend
 * but their data should be accessible in the row (just without a corresponding column, e.g. an index or id).
 *
 * Internal columns are identified by the meta column prop `isInternal`.
 */
export class InternalColumnUtil {
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
    public processInternalColumns(options: { columns: DB.Restructured.Column[]; rows: DB.Row[] }): {
        columns: DB.Restructured.Column[]
        rows: DB.Restructured.Row[]
    } {
        const { columns, rows } = options
        let processedRows = rows
        const nonInternalColumns: DB.Restructured.Column[] = []
        columns.forEach(column => {
            if (column.isInternal) {
                // TODO: automate this process, whenever a column is `isInternal === true` the values should be written into the rows,
                // the key will be ? and must correspond with the type

                if (column.kind === "index")
                    return (processedRows = processedRows.map(row => ({
                        index: row[column.key] as DB.Restructured.Row["index"],
                        ...row,
                    })))

                if (column.name === "ID")
                    return (processedRows = processedRows.map(row => ({
                        _id: row[column.key] as DB.Restructured.Row["_id"],
                        ...row,
                    })))
                if (column.kind === "foreignKey") return

                throw new Error(
                    `SystemError: Not Implemented (This mechanism is not supported yet). Column ${inspect(
                        column,
                        {
                            depth: null,
                        }
                    )}`
                )
            } else nonInternalColumns.push(column) // only keep non internal columns
        })

        if (rows.length !== rows.length) {
            throw new Error(
                `InternalColumn: lost ${
                    rows.length - rows.length
                } rows when processing internal columns (rows: ${rows.length}, processed: ${
                    rows.length
                }).`
            )
        }

        return {
            columns: nonInternalColumns,
            rows: processedRows as DB.Restructured.Row[],
        }
    }
}

export const internalColumnUtil = new InternalColumnUtil()
