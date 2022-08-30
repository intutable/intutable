import { types as lv } from "@intutable/lazy-views";
export declare const CHANNEL = "dekanat-app-plugin";
/**
 * Create a column in a table view, optionally (default is yes) adding it
 * to all of the table's filter views.
 * PM column must already be present.
 * @param {boolean} createInViews if true (default) also create a corresponding
 * column in all of the table's views.
 */
export declare function addColumnToTable(tableId: lv.ViewDescriptor["id"], column: lv.ColumnSpecifier, joinId?: number | null, createInViews?: boolean): {
    channel: string;
    method: string;
    tableId: number;
    column: lv.ColumnSpecifier;
    joinId: number;
    createInViews: boolean;
};
/**
 * Add a column of a table to all views. It must already be present
 * in the table.
 */
export declare function addColumnToViews(tableId: lv.ViewDescriptor["id"], column: lv.ColumnSpecifier): {
    channel: string;
    method: string;
    tableId: number;
    column: lv.ColumnSpecifier;
};
/**
 * Remove a column from a table view and all its filter views.
 */
export declare function removeColumnFromTable(tableId: lv.ViewDescriptor["id"], columnId: lv.ColumnInfo["id"]): {
    channel: string;
    method: string;
    tableId: number;
    columnId: number;
};
