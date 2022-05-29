"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const column_1 = require("@intutable/database/dist/column");
const requests_1 = require("@intutable/database/dist/requests");
const lazy_views_1 = require("@intutable/lazy-views/");
const load_1 = require("./example/load");
let core;
const ADMIN_NAME = "admin@dekanat.de";
let adminId;
async function init(plugins) {
    core = plugins;
    // in init.sql until db supports default values
    // await configureColumnAttributes()
    // for dev mode, create some custom data
    if (process.env["npm_lifecycle_event"] === "dev") {
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
    }
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
