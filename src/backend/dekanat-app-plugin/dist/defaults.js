"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupColumnAttributes = exports.linkColumnAttributes = exports.standardColumnAttributes = exports.defaultViewName = exports.defaultRowOptions = exports.emptyRowOptions = exports.UID_KEY = void 0;
/** Default row options for a new table view. */
const lazy_views_1 = require("@intutable/lazy-views");
const attributes_1 = require("./attributes");
exports.UID_KEY = "_id";
/**
 * Blank row options - no filters, no grouping, no sorting.
 */
function emptyRowOptions() {
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: []
    };
}
exports.emptyRowOptions = emptyRowOptions;
/**
 * Default row options: obviously no filtering or grouping. Only order by
 * UID to keep rows from jumping around when you edit them.
 */
function defaultRowOptions(
/**
 * The interface {@link ParentColumnDescriptor} can take columns of
 * a table or a view. */
columns) {
    const idColumn = columns.find(c => c.name === exports.UID_KEY);
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [
            {
                column: { parentColumnId: idColumn.id, joinId: null },
                order: lazy_views_1.SortOrder.Ascending,
            },
        ],
    };
}
exports.defaultRowOptions = defaultRowOptions;
function defaultViewName() {
    return "Standard";
}
exports.defaultViewName = defaultViewName;
function standardColumnAttributes(displayName, userPrimary) {
    return (0, attributes_1.toSQL)({
        _kind: "standard",
        ...(userPrimary !== undefined && { userPrimary }),
        displayName,
        editable: 1,
        editor: "string",
        formatter: "standard",
    });
}
exports.standardColumnAttributes = standardColumnAttributes;
function linkColumnAttributes(displayName) {
    return (0, attributes_1.toSQL)({
        _kind: "link",
        displayName,
        editable: 1,
        editor: "string",
        formatter: "link"
    });
}
exports.linkColumnAttributes = linkColumnAttributes;
function lookupColumnAttributes(displayName) {
    return (0, attributes_1.toSQL)({
        _kind: "lookup",
        displayName,
        editable: 0,
        editor: "string",
        formatter: "lookup"
    });
}
exports.lookupColumnAttributes = lookupColumnAttributes;
