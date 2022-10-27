import { CustomColumnAttributes } from "../types"

/** Minimum width of a column. */
export const COLUMN_MIN_WIDTH = 128

export function standardColumnAttributes(
    name: string,
    contentType: string,
    columnIndex?: number,
    userPrimary?: boolean
): CustomColumnAttributes {
    return {
        _kind: "standard",
        ...(userPrimary !== undefined && { userPrimary }),
        name,
        __columnIndex__: columnIndex,
        editable: true,
        _cellContentType: contentType,
        minWidth: COLUMN_MIN_WIDTH,
    }
}

export function linkColumnAttributes(
    name: string,
    columnIndex?: number
): CustomColumnAttributes {
    return {
        _kind: "link",
        name,
        __columnIndex__: columnIndex,
        editable: true,
        _cellContentType: "string",
        minWidth: COLUMN_MIN_WIDTH,
    }
}

export function lookupColumnAttributes(
    name: string,
    contentType: string,
    columnIndex?: number
): CustomColumnAttributes {
    return {
        _kind: "lookup",
        name,
        __columnIndex__: columnIndex,
        editable: false,
        _cellContentType: contentType,
        minWidth: COLUMN_MIN_WIDTH,
    }
}

export function indexColumnAttributes(
    columnIndex?: number
): CustomColumnAttributes {
    return {
        name: "Index",
        _kind: "index",
        _cellContentType: "number",
        __columnIndex__: columnIndex,
        editable: false,
        resizable: true,
        sortable: true,
        width: 80,
    }
}
