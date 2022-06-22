/** Default row options for a new table view. */
import {
    ParentColumnDescriptor,
    RowOptions,
    SortOrder,
} from "@intutable/lazy-views/dist/types"
import { toSQL } from "./attributes"
import { CellContentType } from "../../../components/DataGrid/Editor/types/CellContentType"

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
    userPrimary?: boolean
) {
    return toSQL({
        _kind: "standard",
        ...(userPrimary !== undefined && { userPrimary }),
        displayName,
        editable: 1,
        _cellContentType: contentType,
    })
}

export function linkColumnAttributes(displayName: string) {
    return toSQL({
        _kind: "link",
        displayName,
        editable: 1,
        _cellContentType: "string",
    })
}

export function lookupColumnAttributes(
    displayName: string,
    contentType: CellContentType
) {
    return toSQL({
        _kind: "lookup",
        displayName,
        editable: 0,
        _cellContentType: contentType,
    })
}

export function indexColumnAttributes() {
    return toSQL({
        displayName: "Index",
        _kind: "index",
        _cellContentType: "number",
        editable: false,
        resizable: true,
        sortable: true,
        width: 80,
    })
}
