import { DB } from "shared/src/types"
import { inspect } from "util"

/**
 * Internal columns are columns that should not be shipped to the frontend
 * but their data should be accessible in the row (just without a corresponding column, e.g. an index or id).
 *
 * Internal columns are identified by `column.isInternal`.
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
    public processInternalColumns(options: {
        columns: DB.Restructured.Column[]
        rows: DB.Row[]
    }): { columns: DB.Restructured.Column[]; rows: DB.Restructured.Row[] } {
        const { columns, rows } = options
        const processedRows = rows
        const nonInternalColumns = []
        columns.forEach(column => {
            console.log(
                "column.isInternal: ",
                Object.prototype.hasOwnProperty.call(column, "isInternal"),
                "(exists),",
                column.isInternal,
                "(value)",
                "name:",
                column.name
            )
            if (column.isInternal) {
                // TODO: automate this process

                if (column.kind === "index") {
                    rows.forEach(row =>
                        processedRows.push({
                            index: row[
                                column.key
                            ] as DB.Restructured.Row["index"],
                            ...row,
                        })
                    )
                    return
                }

                if (column.name === "ID") {
                    rows.forEach(row =>
                        processedRows.push({
                            _id: row[column.key] as DB.Restructured.Row["_id"],
                            ...row,
                        })
                    )
                    return
                }

                throw new Error(
                    `SystemError: Not Implemented (This mechanism is not supported yet). Column ${inspect(
                        column,
                        { depth: null }
                    )}`
                )
            }

            // only keep non internal columns
            nonInternalColumns.push(column)
        })

        if (rows.length !== processedRows.length) {
            throw new Error(
                `InternalColumn: lost ${
                    rows.length - processedRows.length
                } rows when processing internal columns (rows: ${
                    rows.length
                }, processed: ${processedRows.length}).`
            )
        }

        return {
            columns: nonInternalColumns,
            rows: processedRows as DB.Restructured.Row[],
        }
    }
}

export const internalColumnUtil = new InternalColumnUtil()
