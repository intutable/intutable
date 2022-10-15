import { toSql, ATTRIBUTES as A } from "."

/** Minimum width of a column. */
export const COLUMN_MIN_WIDTH = 128

export function standardColumnAttributes(
    displayName: string,
    contentType: string,
    columnIndex?: number,
    userPrimary?: boolean
): Record<string, unknown> {
    return toSql({
        _kind: "standard",
        ...(userPrimary !== undefined && { userPrimary }),
        displayName,
        [A.COLUMN_INDEX.key]: columnIndex,
        editable: 1,
        _cellContentType: contentType,
        minWidth: COLUMN_MIN_WIDTH,
    })
}

export function linkColumnAttributes(
    displayName: string,
    columnIndex?: number
): Record<string, unknown> {
    return toSql({
        _kind: "link",
        displayName,
        [A.COLUMN_INDEX.key]: columnIndex,
        editable: 1,
        _cellContentType: "string",
        minWidth: COLUMN_MIN_WIDTH,
    })
}

export function lookupColumnAttributes(
    displayName: string,
    contentType: string,
    columnIndex?: number
): Record<string, unknown> {
    return toSql({
        _kind: "lookup",
        displayName,
        [A.COLUMN_INDEX.key]: columnIndex,
        editable: 0,
        _cellContentType: contentType,
        minWidth: COLUMN_MIN_WIDTH,
    })
}

export function indexColumnAttributes(
    columnIndex?: number
): Record<string, unknown> {
    return toSql({
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
