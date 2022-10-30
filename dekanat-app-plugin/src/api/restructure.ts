import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import { DB, MetaColumnProps } from "shared/src/types"
/**
 * Restructures the data from the database to a more usable format.
 * Will be obsolete with a better design in the future.
 */

/** checks if the value is an integer */
const isInteger = (str: unknown): boolean => {
    if (typeof str === "number") return true
    if (typeof str !== "string") return false

    const int = Number.parseInt(str)
    const isInt = isNaN(int) === false

    return isInt
}

/** Restructures (e.g. renaming) the row. Information will be lost. This will be lost in the future */
export const restructureRow = (
    row: DB.Row,
    columns: ColumnInfo[]
): DB.Restructured.Row => {
    const indexColumn = columns.find(
        column => column.attributes.kind === "index"
    )
    if (indexColumn == null)
        throw new RangeError(
            `Could not find any index column when parsing the view.`
        )

    const index = row[indexColumn.key]
    if (typeof index !== "number" || isInteger(index) === false)
        throw new RangeError(`Index is null`)

    return {
        index: index as number,
        ...row,
    } as DB.Restructured.Row
}

/** Restructures (e.g. renaming) the column. Information will be lost. This will be lost in the future */
export const restructureColumn = (
    column: ColumnInfo
): DB.Restructured.Column => {
    const {
        headerRenderer, // omit
        displayName,
        kind,
        cellType,
        index,
        isUserPrimaryKey,
        ...properties
    } = column.attributes as DB.Column

    return {
        id: column.id,
        key: column.key,
        name: displayName,
        isUserPrimaryKey,
        kind: kind as MetaColumnProps["kind"],
        cellType: cellType,
        index: index,
        ...properties,
    }
}
