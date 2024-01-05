import { Core, EventSystem } from "@intutable/core"
import {
    createTable,
    deleteTable,
    insert,
    openConnection,
    select,
} from "@intutable/database/dist/requests"
import {
    can,
    getProjectUsers,
    queryPermissions,
    set,
    setRole,
    unset,
    unsetCondition,
} from "../src/requests"
import { ColumnType, SimpleColumnOption } from "@intutable/database/dist/types"

import path from "path"
import {
    DEFAULT_DB_USERNAME,
    DEFAULT_DB_PASSWORD,
} from "@intutable/user-authentication/dist/environment"
import { GLOBAL_PERMISSION, PERMISSIONS_TABLE_STRUCTURE } from "../src/constants"
import { createReadableConditions, getTableName } from "../src"
import { QueryOptions } from "../src/QueryOptions"

let core: Core
let DB_CONN_ID = "1"

beforeAll(async () => {
    core = await Core.create(
        [
            path.join(__dirname, ".."),
            path.join(__dirname, "../node_modules/@intutable/database"),
            path.join(__dirname, "../node_modules/@intutable/project-management"),
        ],
        new EventSystem(true)
    )
    const open = (await core.events.request(
        openConnection(DEFAULT_DB_USERNAME, DEFAULT_DB_PASSWORD)
    )) as any
    await setupTables()
})

afterAll(async () => {
    await core.events.request(deleteTable(DB_CONN_ID, "users"))
    await core.events.request(deleteTable(DB_CONN_ID, "roles"))
    await core.events.request(deleteTable(DB_CONN_ID, "permissions"))
    await core.events.request(deleteTable(DB_CONN_ID, "p1_roles"))
    await core.events.request(deleteTable(DB_CONN_ID, "p1_permissions"))
    await core.plugins.closeAll()
})

describe("Utility Functions", () => {
    test("Can get global permission table name", () => {
        let tableName = getTableName(GLOBAL_PERMISSION, "permissions")

        expect(tableName).toEqual("permissions")
    })
    test("Can get project permission table name", () => {
        let tableName = getTableName("1", "permissions")

        expect(tableName).toEqual("p1_permissions")
    })
    test("Can split conditions correctly with multiple conditions", () => {
        let conditions = "ABC;CDE;FGH"
        let expected = ["ABC", "CDE", "FGH"]

        expect(createReadableConditions(conditions)).toEqual(expected)
    })
    test("Can split conditions correctly with trailing semicolon", () => {
        let conditions = "ABC;CDE;FGH;"
        let expected = ["ABC", "CDE", "FGH"]

        expect(createReadableConditions(conditions)).toEqual(expected)
    })
    test("Can split conditions correctly with beginning semicolon", () => {
        let conditions = ";ABC;CDE;FGH"
        let expected = ["ABC", "CDE", "FGH"]

        expect(createReadableConditions(conditions)).toEqual(expected)
    })
})

describe("Can add permissions to the table", () => {
    test("add permission to create projects for admin in global permission space", async () => {
        let data = {
            action: "create",
            subject: "project",
            roleId: 0,
            subjectName: "",
            conditions: "",
        }

        await core.events.request(
            set(DB_CONN_ID, data.roleId, data.action, data.subject, data.subjectName, [], "")
        )

        const result = await core.events.request(
            select(DB_CONN_ID, "permissions", {
                condition: [{ roleId: 0, action: "create", subject: "project", subjectName: "" }],
            })
        )

        expect(result[0]).toEqual(data)
    })
    test("can add permission to delete projects for normal user with conditions in global space", async () => {
        let data = {
            action: "delete",
            subject: "project",
            roleId: 1,
            subjectName: "",
            conditions: ["projectA", "projectC"],
        }

        await core.events.request(
            set(
                DB_CONN_ID,
                data.roleId,
                data.action,
                data.subject,
                data.subjectName,
                data.conditions,
                ""
            )
        )

        const result = await core.events.request(
            select(DB_CONN_ID, "permissions", {
                condition: [
                    {
                        roleId: data.roleId,
                        action: data.action,
                        subject: data.subject,
                        subjectName: data.subjectName,
                    },
                ],
            })
        )

        result[0]["conditions"] = createReadableConditions(result[0]["conditions"])
        expect(result[0]["conditions"]).toContain("projectA")
        expect(result[0]["conditions"]).toContain("projectC")
        expect(result[0]).toEqual(data)
    })
    test("can update permission condition to delete table for normal user in global space", async () => {
        let data = {
            action: "delete",
            subject: "project",
            roleId: 1,
            subjectName: "",
            conditions: ["projectA", "projectC"],
        }
        const resultExistingData = await core.events.request(
            select(DB_CONN_ID, "permissions", {
                condition: [
                    {
                        roleId: data.roleId,
                        action: data.action,
                        subject: data.subject,
                        subjectName: data.subjectName,
                    },
                ],
            })
        )
        resultExistingData[0]["conditions"] = createReadableConditions(
            resultExistingData[0]["conditions"]
        )

        expect(resultExistingData[0]).toEqual(data)

        let dataUpdated = {
            action: "delete",
            subject: "project",
            roleId: 1,
            subjectName: "",
            conditions: ["projectA", "projectC", "projectD"],
        }

        await core.events.request(
            set(
                DB_CONN_ID,
                dataUpdated.roleId,
                dataUpdated.action,
                dataUpdated.subject,
                dataUpdated.subjectName,
                dataUpdated.conditions
            )
        )

        const result = await core.events.request(
            select(DB_CONN_ID, "permissions", {
                condition: [
                    {
                        roleId: data.roleId,
                        action: data.action,
                        subject: data.subject,
                        subjectName: data.subjectName,
                    },
                ],
            })
        )

        result[0]["conditions"] = createReadableConditions(result[0]["conditions"])
        expect(result[0]["conditions"]).toContain("projectD")
        expect(result[0]).toEqual(dataUpdated)
    })
})

describe("Can select permissions from the table", () => {
    test("can select permission for creating projects for admin user", async () => {
        const result = await core.events.request(can(DB_CONN_ID, 0, "create", "project", "", ""))

        expect(result["isAllowed"]).toEqual(true)
    })
    test("can return that the guest user is not allowed to create projects", async () => {
        const result = await core.events.request(can(DB_CONN_ID, 2, "create", "project", "", ""))

        expect(result["isAllowed"]).toEqual(false)
    })
    test("can return that the normal user is allowed to delete some projects in the conditions", async () => {
        const result = await core.events.request(can(DB_CONN_ID, 1, "delete", "project", "", ""))

        expect(result["isAllowed"]).toEqual(true)
        expect(result["conditions"]).toBeDefined()
    })
})

describe("Can remove permissions from the table", () => {
    test("can remove project permission for creating projects for admin user", async () => {
        await core.events.request(unset(DB_CONN_ID, 0, "create", "project", "", ""))

        let rows = await core.events.request(
            select(DB_CONN_ID, "permissions", {
                condition: [{ roleId: 0, action: "create", subject: "project", subjectName: "" }],
            })
        )

        expect(rows.length).toEqual(0)
    })
    test("can unset a condition from the normal user", async () => {
        let data = {
            action: "delete",
            subject: "project",
            roleId: 1,
            subjectName: "",
            conditions: ["projectA", "projectC", "projectD"],
        }
        const resultExistingData = await core.events.request(
            select(DB_CONN_ID, "permissions", {
                condition: [
                    {
                        roleId: data.roleId,
                        action: data.action,
                        subject: data.subject,
                        subjectName: data.subjectName,
                    },
                ],
            })
        )
        resultExistingData[0]["conditions"] = createReadableConditions(
            resultExistingData[0]["conditions"]
        )

        expect(resultExistingData[0]).toEqual(data)

        let dataUpdated = {
            action: "delete",
            subject: "project",
            roleId: 1,
            subjectName: "",
            conditions: ["projectA", "projectC"],
        }

        await core.events.request(
            unsetCondition(
                DB_CONN_ID,
                dataUpdated.roleId,
                dataUpdated.action,
                dataUpdated.subject,
                dataUpdated.subjectName,
                "projectD"
            )
        )

        const result = await core.events.request(
            select(DB_CONN_ID, "permissions", {
                condition: [
                    {
                        roleId: data.roleId,
                        action: data.action,
                        subject: data.subject,
                        subjectName: data.subjectName,
                    },
                ],
            })
        )

        result[0]["conditions"] = createReadableConditions(result[0]["conditions"])

        expect(result[0]).toEqual(dataUpdated)
    })
})

describe("Can search for permissions", () => {
    test("Can list all global permissions", async () => {
        await core.events.request(set(DB_CONN_ID, 2, "delete", "project", "", ["projectB"]))

        let data = [
            {
                roleId: 1,
                action: "delete",
                subject: "project",
                subjectName: "",
                conditions: ["projectA", "projectC"],
            },
            {
                roleId: 2,
                action: "delete",
                subject: "project",
                subjectName: "",
                conditions: ["projectB"],
            },
        ]

        let result = await core.events.request(
            queryPermissions(DB_CONN_ID, GLOBAL_PERMISSION, new QueryOptions().getQuery())
        )

        expect(result).toEqual(data)
    })
    test("Can list all global permissions for the subject project", async () => {
        let data = [
            {
                roleId: 1,
                action: "delete",
                subject: "project",
                subjectName: "",
                conditions: ["projectA", "projectC"],
            },
            {
                roleId: 2,
                action: "delete",
                subject: "project",
                subjectName: "",
                conditions: ["projectB"],
            },
        ]

        let result = await core.events.request(
            queryPermissions(
                DB_CONN_ID,
                GLOBAL_PERMISSION,
                new QueryOptions().subject("project").getQuery()
            )
        )

        expect(result).toEqual(data)
    })
    test("Can list all global permissions for the subject project and the action delete", async () => {
        let data = [
            {
                roleId: 1,
                action: "delete",
                subject: "project",
                subjectName: "",
                conditions: ["projectA", "projectC"],
            },
            {
                roleId: 2,
                action: "delete",
                subject: "project",
                subjectName: "",
                conditions: ["projectB"],
            },
        ]

        let result = await core.events.request(
            queryPermissions(
                DB_CONN_ID,
                GLOBAL_PERMISSION,
                new QueryOptions().subject("project").action("delete").getQuery()
            )
        )

        expect(result).toEqual(data)
    })
})

describe("Can get users for project", () => {
    test("Can set role to user", async () => {
        await core.events.request(setRole(DB_CONN_ID, "1", 0, 0))

        const data = [{ roleId: 0, userId: 0 }]

        const result = await core.events.request(
            select(DB_CONN_ID, "p1_users", {
                condition: [{ userId: 0 }],
            })
        )

        expect(result).toEqual(data)
    })

    test("Can list all users for project", async () => {
        const data = [
            {
                _id: 0,
                globalRoleId: 0,
                roleId: 0,
                userId: 0,
                username: "administrator",
            },
        ]

        const result = await core.events.request(getProjectUsers(DB_CONN_ID, "1"))

        expect(result).toEqual(data)
    })
})

async function setupTables() {
    await core.events.request(deleteTable(DB_CONN_ID, "users"))
    await core.events.request(deleteTable(DB_CONN_ID, "roles"))
    await core.events.request(deleteTable(DB_CONN_ID, "permissions"))
    await core.events.request(deleteTable(DB_CONN_ID, "p1_roles"))
    await core.events.request(deleteTable(DB_CONN_ID, "p1_users"))
    await core.events.request(deleteTable(DB_CONN_ID, "p1_permissions"))

    await core.events.request(
        createTable(DB_CONN_ID, "users", [
            {
                name: "_id",
                type: ColumnType.integer,
            },
            {
                name: "username",
                type: ColumnType.text,
            },
            {
                name: "hash",
                type: ColumnType.text,
            },
            {
                name: "globalRoleId",
                type: ColumnType.integer,
            },
        ])
    )
    await core.events.request(
        createTable(DB_CONN_ID, "roles", [
            {
                name: "_id",
                type: ColumnType.increments,
            },
            {
                name: "description",
                type: ColumnType.text,
            },
        ])
    )
    await core.events.request(
        createTable(DB_CONN_ID, "p1_roles", [
            {
                name: "_id",
                type: ColumnType.integer,
                options: [SimpleColumnOption.primary],
            },
            {
                name: "description",
                type: ColumnType.string,
            },
        ])
    )
    await core.events.request(
        createTable(DB_CONN_ID, "p1_users", [
            {
                name: "userId",
                type: ColumnType.integer,
            },
            {
                name: "roleId",
                type: ColumnType.integer,
            },
        ])
    )
    await core.events.request(createTable(DB_CONN_ID, "permissions", PERMISSIONS_TABLE_STRUCTURE))
    await core.events.request(
        createTable(DB_CONN_ID, "p1_permissions", PERMISSIONS_TABLE_STRUCTURE)
    )

    await core.events.request(
        insert(DB_CONN_ID, "users", {
            _id: 0,
            username: "administrator",
            hash: "abc",
            globalRoleId: 0,
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, "users", {
            _id: 1,
            username: "normalUser",
            hash: "abc",
            globalRoleId: 1,
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, "users", {
            _id: 2,
            username: "guest",
            hash: "abc",
            globalRoleId: 2,
        })
    )

    await core.events.request(
        insert(DB_CONN_ID, "roles", {
            _id: 0,
            description: "adminRole",
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, "roles", {
            _id: 1,
            description: "normalRole",
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, "roles", {
            _id: 2,
            description: "guestRole",
        })
    )

    await core.events.request(
        insert(DB_CONN_ID, "p1_roles", {
            _id: 0,
            description: "projectAdminRole",
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, "p1_roles", {
            _id: 1,
            description: "projectNormalRole",
        })
    )
    await core.events.request(
        insert(DB_CONN_ID, "p1_roles", {
            _id: 2,
            description: "projectGuestRole",
        })
    )
}
