import { DB } from "../types"

export function standardColumnAttributes(
    name: string,
    contentType: string,
    columnIndex?: number,
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

export function linkColumnAttributes(
    name: string,
    columnIndex?: number
): Partial<DB.Column> {
    return {
        kind: "link",
        displayName: name,
        index: columnIndex,
        editable: 1,
        cellType: "string",
    }
}

export function lookupColumnAttributes(
    name: string,
    contentType: string,
    columnIndex?: number
): Partial<DB.Column> {
    return {
        kind: "lookup",
        displayName: name,
        index: columnIndex,
        editable: 0,
        cellType: contentType,
    }
}

export function idColumnAttributes(columnIndex?: number): Partial<DB.Column> {
    return {
        kind: "standard",
        displayName: "ID",
        index: columnIndex,
        isInternal: 1,
        editable: 0,
        cellType: "number",
    }
}
export function indexColumnAttributes(
    columnIndex?: number
): Partial<DB.Column> {
    return {
        displayName: "Index",
        kind: "index",
        isInternal: 1,
        cellType: "number",
        index: columnIndex,
        editable: 0,
    }
}
