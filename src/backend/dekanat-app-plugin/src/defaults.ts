/** Default row options for a new table view. */
import {
    ParentColumnDescriptor,
    RowOptions,
    SortOrder,
} from "@intutable/lazy-views/dist/types"
import { toSQL, A } from "./attributes"
import { CellContentType } from "./types"

export const UID_KEY = "_id"
export const INDEX_KEY = "index"

/**
 * Blank row options - no filters, no grouping, no sorting.
 */
export function emptyRowOptions(): RowOptions {
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [],
    }
}

/**
 * Default row options: obviously no filtering or grouping. Only order by
 * index, to keep rows from jumping around when you edit them.
 */
export function defaultRowOptions(
    /**
     * The interface {@link ParentColumnDescriptor} can take columns of
     * a table or a view. */
    columns: ParentColumnDescriptor[]
): RowOptions {
    const indexColumn = columns.find(c => c.name === INDEX_KEY)!
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

export function defaultViewName() {
    return "Standard"
}

export function standardColumnAttributes(
    displayName: string,
    contentType: CellContentType,
    columnIndex?: number,
    userPrimary?: boolean
) {
    return toSQL({
        _kind: "standard",
        ...(userPrimary !== undefined && { userPrimary }),
        displayName,
        [A.COLUMN_INDEX.key]: columnIndex,
        editable: 1,
        _cellContentType: contentType,
    })
}

export function linkColumnAttributes(
    displayName: string,
    columnIndex?: number
) {
    return toSQL({
        _kind: "link",
        displayName,
        [A.COLUMN_INDEX.key]: columnIndex,
        editable: 1,
        _cellContentType: "string",
    })
}

export function lookupColumnAttributes(
    displayName: string,
    contentType: CellContentType,
    columnIndex?: number
) {
    return toSQL({
        _kind: "lookup",
        displayName,
        [A.COLUMN_INDEX.key]: columnIndex,
        editable: 0,
        _cellContentType: contentType,
    })
}

export function indexColumnAttributes(columnIndex?: number) {
    return toSQL({
        displayName: "Index",
        _kind: "index",
        _cellContentType: "number",
        [A.COLUMN_INDEX.key]: columnIndex,
        editable: false,
        resizable: true,
        sortable: true,
        width: 80,
    })
}
