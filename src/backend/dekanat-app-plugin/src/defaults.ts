/** Default row options for a new table view. */
import {
    ParentColumnDescriptor,
    RowOptions,
    SortOrder,
} from "@intutable/lazy-views/dist/types"
import { toSQL } from "./attributes"

export const UID_KEY = "_id"

/**
 * Blank row options - no filters, no grouping, no sorting.
 */
export function emptyRowOptions(): RowOptions {
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: []
    }
}

/**
 * Default row options: obviously no filtering or grouping. Only order by
 * UID to keep rows from jumping around when you edit them.
 */
export function defaultRowOptions(
    /**
     * The interface {@link ParentColumnDescriptor} can take columns of
     * a table or a view. */
    columns: ParentColumnDescriptor[]
): RowOptions {
    const idColumn = columns.find(
        c => c.name === UID_KEY
    )!
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [
            {
                column: { parentColumnId: idColumn.id, joinId: null },
                order: SortOrder.Ascending,
            },
        ],
    }
}

export function defaultViewName(){
    return "Standard"
}

export function standardColumnAttributes(
    displayName: string,
    userPrimary?: boolean
){
    return toSQL({
        _kind: "standard",
        ...(userPrimary !== undefined && { userPrimary }),
        displayName,
        editable: 1,
        editor: "string",
        formatter: "standard",
    })
}

export function linkColumnAttributes(
    displayName: string
) {
    return toSQL({
        _kind: "link",
        displayName,
        editable: 1,
        editor: "string",
        formatter: "link"
    })
}

export function lookupColumnAttributes(
    displayName: string
) {
    return toSQL({
        _kind: "lookup",
        displayName,
        editable: 0,
        editor: "string",
        formatter: "lookup"
    })
}
