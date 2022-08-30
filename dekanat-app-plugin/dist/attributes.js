"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.A = exports.toSQL = void 0;
/** Replace all booleans with 0 or 1 in a given value. */
function toSQL(obj) {
    if (typeof obj === "boolean")
        return (obj ? 1 : 0);
    else if (obj instanceof Object)
        return Object.getOwnPropertyNames(obj).reduce((acc, prop) => Object.assign(acc, { [prop]: toSQL(obj[prop]) }), {});
    else
        return obj;
}
exports.toSQL = toSQL;
exports.A = {
    COLUMN_INDEX: {
        key: "__columnIndex__",
    },
};
