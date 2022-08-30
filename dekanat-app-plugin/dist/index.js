"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const column_1 = require("@intutable/database/dist/column");
const requests_1 = require("@intutable/database/dist/requests");
const requests_2 = require("@intutable/project-management/dist/requests");
const lazy_views_1 = require("@intutable/lazy-views/");
const req = __importStar(require("./requests"));
const attributes_1 = require("./attributes");
const error_1 = require("./internal/error");
const load_1 = require("./example/load");
let core;
const ADMIN_NAME = "admin@dekanat.de";
let adminId;
async function init(plugins) {
    core = plugins;
    // in init.sql until db supports default values
    // await configureColumnAttributes()
    // create some custom data
    const maybeAdminId = await getAdminId();
    if (maybeAdminId === null) {
        adminId = await createAdmin();
        console.log("set up admin user");
    }
    else {
        adminId = maybeAdminId;
        console.log("admin user already present");
    }
    // testing data
    if (maybeAdminId === null) {
        console.log("creating and populating example schema");
        await (0, load_1.createExampleSchema)(core, adminId);
        await (0, load_1.insertExampleData)(core);
    }
    else
        console.log("skipped creating example schema");
    core.listenForRequests(req.CHANNEL)
        .on(req.addColumnToTable.name, addColumnToTable_)
        .on(req.addColumnToViews.name, addColumnToFilterViews_)
        .on(req.removeColumnFromTable.name, removeColumnFromTable_);
}
exports.init = init;
async function getAdminId() {
    const userRows = await core.events.request((0, requests_1.select)("users", {
        columns: ["_id"],
        condition: ["email", ADMIN_NAME],
    }));
    if (userRows.length > 1)
        return Promise.reject("fatal: multiple users with same name exist");
    else if (userRows.length === 1)
        return userRows[0]["_id"];
    else
        return null;
}
/** Create admin user */
async function createAdmin() {
    await core.events.request((0, requests_1.insert)("users", {
        email: ADMIN_NAME,
        password: "$argon2i$v=19$m=4096,t=3,p=1$vzOdnV+KUtQG3va/nlOOxg$vzo1JP16rQKYmXzQgYT9VjUXUXPA6cWHHAvXutrRHtM",
    }));
    return getAdminId().then(definitelyNumber => definitelyNumber);
}
/** Create the custom attributes for views' columns we need. */
async function configureColumnAttributes() {
    const customColumns = [
        {
            name: "displayName",
            type: column_1.ColumnType.text,
            options: [column_1.ColumnOption.nullable],
        },
        {
            name: "userPrimary",
            type: column_1.ColumnType.integer,
            options: [column_1.ColumnOption.notNullable],
        },
        {
            name: "editable",
            type: column_1.ColumnType.integer,
            options: [column_1.ColumnOption.notNullable],
        },
        {
            name: "editor",
            type: column_1.ColumnType.text,
            options: [column_1.ColumnOption.nullable],
        },
        {
            name: "formatter",
            type: column_1.ColumnType.text,
            options: [column_1.ColumnOption.nullable],
        },
    ];
    await Promise.all(customColumns.map(c => core.events.request(lazy_views_1.requests.addColumnAttribute(c))));
}
async function addColumnToTable_({ tableId, column, joinId, createInViews, }) {
    return addColumnToTable(tableId, column, joinId, createInViews);
}
async function addColumnToTable(tableId, column, joinId = null, createInViews = true) {
    const tableColumn = (await core.events.request(lazy_views_1.requests.addColumnToView(tableId, column, joinId)));
    if (createInViews)
        await addColumnToFilterViews(tableId, {
            parentColumnId: tableColumn.id,
            attributes: tableColumn.attributes,
        });
    return tableColumn;
}
async function addColumnToFilterViews_({ tableId, column, }) {
    return addColumnToFilterViews(tableId, column);
}
async function addColumnToFilterViews(tableId, column) {
    const filterViews = (await core.events.request(lazy_views_1.requests.listViews(lazy_views_1.selectable.viewId(tableId))));
    return Promise.all(filterViews.map(v => core.events.request(lazy_views_1.requests.addColumnToView(v.id, column))));
}
async function removeColumnFromTable_({ tableId, columnId, }) {
    return removeColumnFromTable(tableId, columnId);
}
async function removeColumnFromTable(tableId, columnId) {
    let tableInfo = (await core.events.request(lazy_views_1.requests.getViewInfo(tableId)));
    if (!lazy_views_1.selectable.isTable(tableInfo.source))
        return (0, error_1.error)("removeColumnFromTable", `view #${tableId} is a filter view, not a table`);
    const column = tableInfo.columns.find(c => c.id === columnId);
    if (!column)
        return (0, error_1.error)("removeColumnFromTable", `view #${tableId} has no column with ID ${columnId}`);
    const kind = column.attributes._kind;
    switch (kind) {
        case "standard":
            await removeStandardColumn(tableId, column);
            break;
        case "link":
            await removeLinkColumn(tableId, column);
            break;
        case "lookup":
            await removeLookupColumn(tableId, columnId);
            break;
        default:
            return (0, error_1.error)("removeColumnFromTable", `column #${columnId} has unknown kind ${kind}`);
    }
    // shift indices on remaining columns
    // in case of links, more columns than the one specified may have
    // disappeared, so we need to refresh.
    tableInfo = (await core.events.request(lazy_views_1.requests.getViewInfo(tableId)));
    const indexKey = attributes_1.A.COLUMN_INDEX.key;
    const columnUpdates = getColumnIndexUpdates(tableInfo.columns);
    await Promise.all(columnUpdates.map(async (c) => changeTableColumnAttributes(tableId, c.id, { [indexKey]: c.index })));
    return { message: `removed ${kind} column #${columnId}` };
}
async function removeLinkColumn(tableId, column) {
    const info = (await core.events.request(lazy_views_1.requests.getViewInfo(tableId)));
    const join = info.joins.find(j => j.id === column.joinId);
    if (!join)
        return (0, error_1.error)("removeColumnFromTable", `column belongs to join ${column.joinId}, but no such join found`);
    // remove lookup columns
    const lookupColumns = info.columns.filter(c => c.joinId === join.id && c.attributes._kind === "lookup");
    await Promise.all(lookupColumns.map(async (c) => removeColumnFromTable(tableId, c.id)));
    // remove link column
    await removeColumnFromViews(tableId, column.id);
    await core.events.request(lazy_views_1.requests.removeColumnFromView(column.id));
    // remove join and FK column
    await core.events.request(lazy_views_1.requests.removeJoinFromView(join.id));
    const fkColumnId = join.on[0];
    await core.events.request((0, requests_2.removeColumn)(fkColumnId));
}
async function removeStandardColumn(tableId, column) {
    await removeColumnFromViews(tableId, column.id);
    await core.events.request(lazy_views_1.requests.removeColumnFromView(column.id));
    await core.events.request((0, requests_2.removeColumn)(column.parentColumnId));
}
async function removeLookupColumn(tableId, columnId) {
    await removeColumnFromViews(tableId, columnId);
    await core.events.request(lazy_views_1.requests.removeColumnFromView(columnId));
}
async function removeColumnFromViews(tableId, parentColumnId) {
    const views = (await core.events.request(lazy_views_1.requests.listViews(lazy_views_1.selectable.viewId(tableId))));
    await Promise.all(views.map(async (v) => {
        const info = (await core.events.request(lazy_views_1.requests.getViewInfo(v.id)));
        const viewColumn = info.columns.find(c => c.parentColumnId === parentColumnId);
        if (viewColumn)
            await core.events.request(lazy_views_1.requests.removeColumnFromView(viewColumn.id));
    }));
}
/**
 * Given a list of columns, return a list of columns whose index is wrong
 * and the new index it they should have.
 */
function getColumnIndexUpdates(columns) {
    const indexKey = attributes_1.A.COLUMN_INDEX.key;
    return columns
        .map((c, index) => ({ column: c, index }))
        .filter(pair => pair.column.attributes[indexKey] !== pair.index)
        .map(pair => ({
        id: pair.column.id,
        index: pair.index
    }));
}
async function changeTableColumnAttributes(tableId, columnId, attributes, changeInViews = true) {
    await core.events.request(lazy_views_1.requests.changeColumnAttributes(columnId, attributes));
    if (changeInViews)
        return changeColumnAttributesInViews(tableId, columnId, attributes);
}
async function changeColumnAttributesInViews(tableId, columnId, attributes) {
    const views = (await core.events.request(lazy_views_1.requests.listViews(lazy_views_1.selectable.viewId(tableId))));
    const viewColumns = await Promise.all(views.map(async (v) => {
        const info = (await core.events.request(lazy_views_1.requests.getViewInfo(v.id)));
        const viewColumn = info.columns.find(c => c.parentColumnId === columnId);
        return viewColumn || null;
    }));
    await Promise.all(viewColumns.map(async (c) => core.events.request(lazy_views_1.requests.changeColumnAttributes(c.id, attributes))));
}
