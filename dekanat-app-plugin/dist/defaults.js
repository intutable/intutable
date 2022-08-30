"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexColumnAttributes = exports.lookupColumnAttributes = exports.linkColumnAttributes = exports.standardColumnAttributes = exports.defaultViewName = exports.defaultRowOptions = exports.emptyRowOptions = exports.COLUMN_MIN_WIDTH = exports.INDEX_KEY = exports.UID_KEY = void 0;
/** Default row options for a new table view. */
const types_1 = require("@intutable/lazy-views/dist/types");
const attributes_1 = require("./attributes");
exports.UID_KEY = "_id";
exports.INDEX_KEY = "index";
/** Minimum width of a column. */
exports.COLUMN_MIN_WIDTH = 128;
/**
 * Blank row options - no filters, no grouping, no sorting.
 */
function emptyRowOptions() {
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [],
    };
}
exports.emptyRowOptions = emptyRowOptions;
/**
 * Default row options: obviously no filtering or grouping. Only order by
 * index, to keep rows from jumping around when you edit them.
 */
function defaultRowOptions(
/**
 * The interface {@link ParentColumnDescriptor} can take columns of
 * a table or a view. */
columns) {
    const indexColumn = columns.find(c => c.name === exports.INDEX_KEY);
    return {
        conditions: [],
        groupColumns: [],
        sortColumns: [
            {
                column: { parentColumnId: indexColumn.id, joinId: null },
                order: types_1.SortOrder.Ascending,
            },
        ],
    };
}
exports.defaultRowOptions = defaultRowOptions;
function defaultViewName() {
    return "Standard";
}
exports.defaultViewName = defaultViewName;
function standardColumnAttributes(displayName, contentType, columnIndex, userPrimary) {
    return (0, attributes_1.toSQL)({
        _kind: "standard",
        ...(userPrimary !== undefined && { userPrimary }),
        displayName,
        [attributes_1.A.COLUMN_INDEX.key]: columnIndex,
        editable: 1,
        _cellContentType: contentType,
        minWidth: exports.COLUMN_MIN_WIDTH,
    });
}
exports.standardColumnAttributes = standardColumnAttributes;
function linkColumnAttributes(displayName, columnIndex) {
    return (0, attributes_1.toSQL)({
        _kind: "link",
        displayName,
        [attributes_1.A.COLUMN_INDEX.key]: columnIndex,
        editable: 1,
        _cellContentType: "string",
        minWidth: exports.COLUMN_MIN_WIDTH,
    });
}
exports.linkColumnAttributes = linkColumnAttributes;
function lookupColumnAttributes(displayName, contentType, columnIndex) {
    return (0, attributes_1.toSQL)({
        _kind: "lookup",
        displayName,
        [attributes_1.A.COLUMN_INDEX.key]: columnIndex,
        editable: 0,
        _cellContentType: contentType,
        minWidth: exports.COLUMN_MIN_WIDTH,
    });
}
exports.lookupColumnAttributes = lookupColumnAttributes;
function indexColumnAttributes(columnIndex) {
    return (0, attributes_1.toSQL)({
        displayName: "Index",
        _kind: "index",
        _cellContentType: "number",
        [attributes_1.A.COLUMN_INDEX.key]: columnIndex,
        editable: false,
        resizable: true,
        sortable: true,
        width: 80,
    });
}
exports.indexColumnAttributes = indexColumnAttributes;
