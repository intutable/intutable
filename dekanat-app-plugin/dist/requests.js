"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeColumnFromTable = exports.addColumnToViews = exports.addColumnToTable = exports.CHANNEL = void 0;
exports.CHANNEL = "dekanat-app-plugin";
/**
 * Create a column in a table view, optionally (default is yes) adding it
 * to all of the table's filter views.
 * PM column must already be present.
 * @param {boolean} createInViews if true (default) also create a corresponding
 * column in all of the table's views.
 */
function addColumnToTable(tableId, column, joinId = null, createInViews = true) {
    return {
        channel: exports.CHANNEL,
        method: addColumnToTable.name,
        tableId,
        column,
        joinId,
        createInViews,
    };
}
exports.addColumnToTable = addColumnToTable;
/**
 * Add a column of a table to all views. It must already be present
 * in the table.
 */
function addColumnToViews(tableId, column) {
    return {
        channel: exports.CHANNEL,
        method: addColumnToViews.name,
        tableId,
        column,
    };
}
exports.addColumnToViews = addColumnToViews;
/**
 * Remove a column from a table view and all its filter views.
 */
function removeColumnFromTable(tableId, columnId) {
    return {
        channel: exports.CHANNEL,
        method: removeColumnFromTable.name,
        tableId,
        columnId,
    };
}
exports.removeColumnFromTable = removeColumnFromTable;
