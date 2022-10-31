import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import { DB, MetaColumnProps } from "shared/src/types"
import { Cast } from "./cast"
/**
 * Restructures the data from the database to a more usable format.
 * Will be obsolete with a better design in the future.
 */

export class Restructure {
    public processInternalColumns() {}

    /** Restructures (e.g. renaming) the row. Information will be lost. This will be lost in the future */
    public row(row: DB.Row, columns: ColumnInfo[]): DB.Restructured.Row {
        const indexColumn = columns.find(
            column => column.attributes.kind === "index"
        )
        if (indexColumn == null)
            throw new RangeError(
                `Could not find any index column when parsing the view.`
            )

        const index = row[indexColumn.key]
        if (typeof index !== "number" || Cast.isInteger(index) === false)
            throw new RangeError(`Index is null`)

        return {
            index: index as number,
            ...row,
        } as DB.Restructured.Row
    }

    /** Restructures (e.g. renaming) the column. Information will be lost. This will be lost in the future */
    public column(column: ColumnInfo): DB.Restructured.Column {
        const {
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
}
