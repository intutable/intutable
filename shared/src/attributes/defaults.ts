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
        kind: "standard",
        ...(userPrimary !== undefined && { isUserPrimaryKey: userPrimary }),
        name,
        index: columnIndex,
        editable: true,
        cellType: contentType,
        minWidth: COLUMN_MIN_WIDTH,
    }
}

export function linkColumnAttributes(
    name: string,
    columnIndex?: number
): CustomColumnAttributes {
    return {
        kind: "link",
        name,
        index: columnIndex,
        editable: true,
        cellType: "string",
        minWidth: COLUMN_MIN_WIDTH,
    }
}

export function lookupColumnAttributes(
    name: string,
    contentType: string,
    columnIndex?: number
): CustomColumnAttributes {
    return {
        kind: "lookup",
        name,
        index: columnIndex,
        editable: false,
        cellType: contentType,
        minWidth: COLUMN_MIN_WIDTH,
    }
}

export function idColumnAttributes(
    columnIndex?: number
): CustomColumnAttributes {
    return {
        kind: "standard",
        name: "ID",
        index: columnIndex,
        isInternal: true,
        editable: false,
        cellType: "number",
    }
}
export function indexColumnAttributes(
    columnIndex?: number
): CustomColumnAttributes {
    return {
        name: "Index",
        kind: "index",
        cellType: "number",
        index: columnIndex,
        editable: false,
        resizable: true,
        sortable: true,
        width: 80,
    }
}
