import { ColumnInfo } from "@intutable/lazy-views/dist/types"
import { DB, MetaColumnProps } from "shared/src/types"

/**
 * Restructures the data from the database to a more usable format.
 * Will be obsolete with a better design in the future.
 */

export class Restructure {
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

    public revert() {}
}
