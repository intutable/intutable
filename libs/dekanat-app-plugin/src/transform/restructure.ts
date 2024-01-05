import { ColumnInfo as RawColumn } from "@intutable-org/lazy-views/dist/types"
import { DB, MetaColumnProps } from "shared/dist/types"

/**
 * Restructures the data from the database as an intermediate step in parsing.
 * Restructuring changes the relationships of the column's props and renames some, but
 * does not cast/convert data types or any other changes yet.
 */
export class Restructure {
    /** Restructures (e.g. renaming) the column. Information will be lost. */
    public column(column: RawColumn): DB.Restructured.Column {
        const { displayName, kind, ...properties } = column.attributes as DB.Column

        return {
            id: column.id,
            parentColumnId: column.parentColumnId,
            linkId: column.joinId,
            key: column.key,
            name: displayName,
            kind: kind as MetaColumnProps["kind"],
            ...properties,
        }
    }
}

export const restructure = new Restructure()
