"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertExampleData = exports.createExampleSchema = void 0;
const requests_1 = require("@intutable/database/dist/requests");
const requests_2 = require("@intutable/project-management/dist/requests");
const lazy_views_1 = require("@intutable/lazy-views/");
const lazy_views_2 = require("@intutable/lazy-views");
const defaults_1 = require("../defaults");
const schema_1 = require("./schema");
let personen;
let organe;
let simpleTables;
let rollen;
async function createExampleSchema(core, adminId) {
    const project = (await core.events.request((0, requests_2.createProject)(adminId, "Fakultät MathInf")));
    personen = await createTable(core, adminId, project.id, schema_1.PERSONEN);
    organe = await createTable(core, adminId, project.id, schema_1.ORGANE);
    simpleTables = [personen, organe];
    rollen = await createTable(core, adminId, project.id, schema_1.ROLLEN);
}
exports.createExampleSchema = createExampleSchema;
async function createTable(core, userId, projectId, table) {
    const baseTable = (await core.events.request((0, requests_2.createTableInProject)(userId, projectId, table.name, table.columns.map(c => c.baseColumn))));
    const tableInfo = (await core.events.request((0, requests_2.getTableInfo)(baseTable.id)));
    const viewColumns = table.columns.map(c => {
        const baseColumn = tableInfo.columns.find(parent => parent.name === c.baseColumn.name);
        return {
            parentColumnId: baseColumn.id,
            attributes: c.attributes,
        };
    });
    const tableView = (await core.events.request(lazy_views_1.requests.createView((0, lazy_views_2.tableId)(baseTable.id), table.name, { columns: viewColumns, joins: [] }, (0, defaults_1.emptyRowOptions)(), userId)));
    // add joins
    await Promise.all(table.joins.map(j => addJoin(core, baseTable, tableView, j)));
    const tableViewInfo = (await core.events.request(lazy_views_1.requests.getViewInfo(tableView.id)));
    const filterView = await core.events.request(lazy_views_1.requests.createView((0, lazy_views_2.viewId)(tableView.id), "Standard", { columns: [], joins: [] }, (0, defaults_1.defaultRowOptions)(tableViewInfo.columns), userId));
    const tableDescriptors = { baseTable, tableView, filterView };
    return tableDescriptors;
}
async function addJoin(core, baseTable, tableView, join) {
    const fk = (await core.events.request((0, requests_2.createColumnInTable)(baseTable.id, join.fkColumn.name, join.fkColumn.type)));
    const foreignTable = simpleTables.find(t => t.tableView.name === join.table);
    const info = (await core.events.request(lazy_views_1.requests.getViewInfo(foreignTable.tableView.id)));
    const pk = info.columns.find(c => c.name === join.pkColumn);
    const foreignColumns = join.linkColumns.map(l => {
        const parentColumn = info.columns.find(c => c.name === l.name);
        return {
            parentColumnId: parentColumn.id,
            attributes: l.attributes,
        };
    });
    await core.events.request(lazy_views_1.requests.addJoinToView(tableView.id, {
        foreignSource: (0, lazy_views_2.viewId)(foreignTable.tableView.id),
        on: [fk.id, "=", pk.id],
        columns: foreignColumns,
    }));
}
async function insertExampleData(core) {
    await Promise.all(schema_1.PERSONEN_DATA.map(r => core.events.request((0, requests_1.insert)(personen.baseTable.key, r))));
    await Promise.all(schema_1.ORGANE_DATA.map(r => core.events.request((0, requests_1.insert)(organe.baseTable.key, r))));
    await Promise.all(schema_1.ROLLEN_DATA.map(r => core.events.request((0, requests_1.insert)(rollen.baseTable.key, r))));
}
exports.insertExampleData = insertExampleData;
