/** 
 * Internal constants, e.g. fixed column attributes for different column kinds
 */
import { DB } from "shared/dist/types"
import { ROW_INDEX_KEY } from "shared/dist/api"
import { RawViewColumnInfo, RawViewInfo } from "./types/raw"
import { RowOptions, ParentColumnDescriptor, ColumnSpecifier, SortOrder, JoinDescriptor } from "@intutable/lazy-views"

/**
 * Default attributes for a standard column.
 */
export function standardColumnAttributes(
    name: string,
    contentType: string,
    columnIndex: number,
    userPrimary?: boolean
): Partial<DB.Column> {
    return {
        kind: "standard",
        ...(userPrimary !== undefined && {
            isUserPrimaryKey: userPrimary ? 1 : 0,
        }),
        displayName: name,
        index: columnIndex,
        editable: 1,
        cellType: contentType,
    }
}

export function linkColumnAttributes(name: string, columnIndex: number): Partial<DB.Column> {
    return {
        kind: "link",
        displayName: name,
        index: columnIndex,
        editable: 1,
        cellType: "string",
    }
}
export function backwardLinkColumnAttributes(
    name: string,
    parentColumnCellType: string,
    columnIndex: number
): Partial<DB.Column> {
    return {
        kind: "backwardLink",
        displayName: name,
        index: columnIndex,
        editable: 1,
        cellType: "backward-link",
        cellTypeParameter: parentColumnCellType,
    }
}
export function foreignKeyColumnAttributes(columnIndex: number): Partial<DB.Column> {
    return {
        kind: "foreignKey",
        index: columnIndex,
        cellType: "number",
        isInternal: 1,
        editable: 0,
    }
}
export function lookupColumnAttributes(
    name: string,
    parentColumn: RawViewColumnInfo,
    columnIndex: number
): Partial<DB.Column> {
    return {
        kind: "lookup",
        displayName: name,
        index: columnIndex,
        editable: 0,
        cellType: parentColumn.attributes.cellType || "string",
    }
}
export function backwardLookupColumnAttributes(
    name: string,
    parentColumn: RawViewColumnInfo,
    columnIndex: number
): Partial<DB.Column> {
    const cellTypeParameter = ["backwardLink", "backwardLookup"].includes(
        parentColumn.attributes.kind
    )
        ? parentColumn.attributes.cellTypeParameter
        : parentColumn.attributes.cellType
    return {
        kind: "backwardLookup",
        displayName: name,
        index: columnIndex,
        editable: 0,
        cellType: "backward-link",
        cellTypeParameter,
    }
}

export function idColumnAttributes(columnIndex: number): Partial<DB.Column> {
    return {
        kind: "standard",
        displayName: "ID",
        index: columnIndex,
        isInternal: 1,
        editable: 0,
        cellType: "number",
    }
}
export function indexColumnAttributes(columnIndex: number): Partial<DB.Column> {
    return {
        displayName: "Index",
        kind: "index",
        isInternal: 1,
        cellType: "number",
        index: columnIndex,
        editable: 0,
    }
}

/**
 * Standard `RowOptions` for a table. The rows are grouped by ID. All columns in the home table
 * can stay ungrouped, since the ID is a primary key and PG understands that it will thus be
 * unique.
 */
export function defaultTableRowOptions(idColumnId: number): RowOptions {
    return {
        conditions: [],
        groupColumns: [{ parentColumnId: idColumnId, joinId: null }],
        sortColumns: [],
    }
}

/**
 * Default row options: obviously no filtering or grouping. Only order by
 * index, to keep rows from jumping around when you edit them.
 */
export function defaultViewRowOptions(
    /**
     * To order by the index column, we need to have access to that column's
     * ID, so you unfortunately have to pass the source table's columns in.
     */
    columns: ParentColumnDescriptor[]
): RowOptions {
    const indexColumn = columns.find(c => c.name === ROW_INDEX_KEY)!
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [
            {
                column: { parentColumnId: indexColumn.id, joinId: null },
                order: SortOrder.Ascending,
            },
        ],
    }
}

/**
 * All tables' rows are grouped by ID (to avoid duplicates caused by joins). Now, PG can tell
 * that the ID is unique and that other columns from the same table do not have to be aggregated.
 * Unfortunately, the LV plugin just automatically ARRAY_AGGs all non-grouping columns as soon
 * as a group is applied, leading to a bunch of unnecessary singleton arrays in this case,
 * unless this is overridden with a custom `outputFunc` prop. Here, we are
 * overriding `outputFunc` with a trivial non-aggregation to work around this.
 */
export function noAggregation(): ColumnSpecifier["outputFunc"] {
    return "??"
}

/**
 * Since forward link columns are grouped on the home table's (unique) ID, there will be
 * no duplicates in link/lookup columns. But, unlike with the ID of the home table, PG cannot
 * figure this out and demands that we aggregate them into singleton arrays. This aggregate
 * function aggregates item(s) into a JSON array and directly gets the first element. The best
 * part: if there are no rows to be aggregated, PG returns a singleton array with a null, so
 * it just automatically works with no special case.
 * We use `JSON_AGG` instead of `ARRAY_AGG`, because `ARRAY_AGG` does not play nice with nesting,
 * and nesting is what we are aaaaaall about.
 */
export function firstItemAggregation(): ColumnSpecifier["outputFunc"] {
    return "(JSON_AGG(??))->0"
}

/**
 * For backward links, we have to aggregate multiple values into an array. We also need each value
 * to be connected with its row's ID and the display type that the contents should be rendered with
 * in the gui. So we want {@link shared.types.gui.BackwardLinkCellContent}. This output function
 * packages the IDs and values together. Unfortunately, using lazy-views `preGroup` option on the
 * join forces them to be collected into arrays before our `backwardLinkAggregation` can be applied
 * - so instead of { value: string, _id: number }[], we have { value: string[], _id: number[] }.
 * So the parser has to zip these arrays together, in addition to adding the appropriate
 * (display) cell type.
 * @param {RawViewInfo} homeTableInfo the metadata of the home table (i.e. the one that has the
 * forward link corresponding to the backward link we're creating)
 * @param {RawViewColumnInfo} homeIdColumn the ID column of the home table
 */
export function backwardLinkAggregation(
    join: JoinDescriptor,
    homeTableInfo: RawViewInfo,
    homeIdColumn: RawViewColumnInfo
): ColumnSpecifier["outputFunc"] {
    // yes, this is guaranteed to be the right column name for ID, for now at least.
    const idKey = `"j${join.id}_${homeTableInfo.descriptor.name}"."${homeIdColumn.key}"`
    return `(JSON_AGG(JSON_BUILD_OBJECT('value', ??, '_id', ${idKey}))->0)`
}
