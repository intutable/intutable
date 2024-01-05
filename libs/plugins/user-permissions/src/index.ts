import {
    CoreRequest,
    CoreResponse,
    PluginLoader,
    CoreNotification,
    Core,
} from "@intutable-org/core"
import {
    createTable,
    deleteRow,
    insert,
    openConnection,
    rawQuery,
    select,
    update,
} from "@intutable-org/database/dist/requests"
import { ColumnType, SimpleColumnOption } from "@intutable-org/database/dist/types"
import { GLOBAL_PERMISSION, PERMISSIONS_TABLE_STRUCTURE } from "./constants"
import {
    DEFAULT_DB_PASSWORD,
    DEFAULT_DB_USERNAME,
} from "@intutable-org/user-authentication/dist/environment"
import { createdProject, getProjects } from "@intutable-org/project-management/dist/requests"
import { PermissionEntry, PermissionResult } from "./definitions"
import { ProjectDescriptor } from "@intutable-org/project-management/dist/types"

let plugins: PluginLoader
let connectionId: string

const ROLE_ID = 0

export async function init(pluginLoader: PluginLoader) {
    plugins = pluginLoader
    plugins
        .listenForRequests("user-permissions")
        .on("can", can)
        .on("set", set)
        .on("unset", unset)
        .on("unsetCondition", unsetCondition)
        .on("setRole", setRole)
        .on("revokeRole", revokeRole)
        .on("createRole", createRole)
        .on("deleteRole", deleteRole)
        .on("listRoles", listRoles)
        .on("queryPermissions", queryPermissions)
        .on("getRoles", getRoles)
        .on("getProjectUsers", getProjectUsers)

    plugins
        .listenForNotifications("project-management")
        .on(createdProject, createPermissionTablesInProject)

    const openedConnection = await plugins.events.request(
        openConnection(DEFAULT_DB_USERNAME, DEFAULT_DB_PASSWORD)
    )
    connectionId = openedConnection.connectionId
}

export async function close() {}

export function getConnectionId(): string {
    return connectionId
}

async function can(request: CoreRequest): Promise<CoreResponse> {
    return await checkPermission(
        connectionId,
        request.roleId,
        request.action,
        request.subject,
        request.subjectName,
        request.project
    )
}

async function set(request: CoreRequest): Promise<CoreResponse> {
    const table = getTableName(request.project, "permissions")

    const result = await checkPermission(
        connectionId,
        request.roleId,
        request.action,
        request.subject,
        request.subjectName,
        request.project
    )

    const conditions = createConditionString(request.conditions)

    if (!result.isAllowed) {
        await plugins.events.request(
            insert(connectionId, table, {
                roleId: request.roleId,
                action: request.action,
                subject: request.subject,
                subjectName: request.subjectName,
                conditions: conditions,
            })
        )
        return { message: "Inserted new permission" }
    } else {
        // Todo Check if includes checks for multiple elements.
        if (result.conditions.includes(conditions)) {
            await plugins.events.request(
                update(connectionId, table, {
                    update: {
                        action: request.action,
                        subject: request.subject,
                        subjectName: request.subjectName,
                    },
                    condition: [
                        {
                            roleId: request.roleId,
                            action: request.action,
                            subject: request.subject,
                            subjectName: request.subjectName,
                        },
                    ],
                })
            )
        } else {
            await plugins.events.request(
                update(connectionId, table, {
                    update: {
                        action: request.action,
                        subject: request.subject,
                        subjectName: request.subjectName,
                        conditions: conditions,
                    },
                    condition: [
                        {
                            roleId: request.roleId,
                            action: request.action,
                            subject: request.subject,
                            subjectName: request.subjectName,
                        },
                    ],
                })
            )
        }
        return { message: "Updated existing permission" }
    }
}

async function unset(request: CoreRequest): Promise<CoreResponse> {
    const table = getTableName(request.project, "permissions")

    await plugins.events.request(
        deleteRow(connectionId, table, [
            {
                roleId: request.roleId,
                action: request.action,
                subject: request.subject,
                subjectName: request.subjectName,
            },
        ])
    )

    return { message: "deleted permission" }
}

async function unsetCondition(request: CoreRequest): Promise<CoreResponse> {
    const table = getTableName(request.project, "permissions")

    const result = await checkPermission(
        connectionId,
        request.roleId,
        request.action,
        request.subject,
        request.subjectName,
        request.project
    )

    if (result.conditions.includes(request.condition)) {
        let updatedConditions = result.conditions
        updatedConditions = updatedConditions.filter(s => s != request.condition)

        await plugins.events.request(
            update(connectionId, table, {
                update: { conditions: createConditionString(updatedConditions) },
                condition: [
                    {
                        roleId: request.roleId,
                        action: request.action,
                        subject: request.subject,
                        subjectName: request.subjectName,
                    },
                ],
            })
        )
    } else {
        return { message: "Condition not found. Doing nothing." }
    }
}

async function userToRoleId(connectionId: string, username: string): Promise<number> {
    const id = (await plugins.events.request(
        select(connectionId, "users", {
            columns: ["globalRoleId"],
            condition: ["username", username],
        })
    )) as Array<Record<string, number>>

    return id[0]["globalRoleId"]
}

async function checkPermission(
    connectionId: string,
    roleId: number,
    action: string,
    subject: string,
    subjectName: string,
    project: string
): Promise<PermissionResult> {
    const table = getTableName(project, "permissions")

    const rows = await plugins.events.request(
        select(connectionId, table, {
            condition: [
                { roleId: roleId, action: action, subject: subject, subjectName: subjectName },
            ],
        })
    )
    if (rows.length == 0) {
        return {
            isAllowed: false,
            conditions: [],
        }
    } else {
        return {
            isAllowed: rows.length != 0,
            conditions: createReadableConditions(rows[0]["conditions"]),
        }
    }
}

export function createReadableConditions(conditions: string) {
    if (Array.from(conditions)[0] == ";") {
        conditions = conditions.substring(1)
    }
    if (Array.from(conditions)[conditions.length - 1] == ";") {
        conditions = conditions.substring(0, conditions.length - 1)
    }
    return conditions.split(";")
}

export function createConditionString(conditions: string[]) {
    let conditionString = ""
    if (conditions.length != 0) {
        for (const condition of conditions) {
            conditionString += condition
            conditionString += ";"
        }
    }
    return conditionString
}

async function setRole(request: CoreRequest): Promise<CoreResponse> {
    if (request.project == GLOBAL_PERMISSION) {
        await plugins.events.request(
            update(request.connectionId, "users", {
                update: { globalRoleId: request.roleId },
                condition: [{ id: request.userId }],
            })
        )
    } else {
        const table: string = getTableName(request.project, "users")

        await plugins.events.request(
            insert(request.connectionId, table, {
                userId: request.userId,
                roleId: request.roleId,
            })
        )
    }
}

async function revokeRole(request: CoreRequest): Promise<CoreResponse> {
    if (request.project == GLOBAL_PERMISSION) {
        // TODO undefined behaviour what happens in this case?
    } else {
        const table: string = getTableName(request.project, "users")

        await plugins.events.request(
            deleteRow(request.connectionId, table, [
                { userId: request.userId, roleId: request.roleId },
            ])
        )
    }
}

async function createRole(request: CoreRequest): Promise<CoreResponse> {
    const table: string = getTableName(request.project, "roles")

    await plugins.events.request(
        insert(request.connectionId, table, {
            description: request.description,
        })
    )
}

async function deleteRole(request: CoreRequest): Promise<CoreResponse> {
    return { message: "NOT YET IMPLEMENTED" }
}

async function listRoles(request: CoreRequest): Promise<CoreResponse> {
    const table: string = getTableName(request.project, "roles")

    return await plugins.events.request(select(request.connectionId, table))
}

async function queryPermissions(request: CoreRequest): Promise<PermissionEntry[]> {
    const table = getTableName(request.project, "permissions")

    const results = await plugins.events.request(
        select(request.connectionId, table, { condition: [request.query] })
    )
    const permissions: PermissionEntry[] = []

    for (const result of results) {
        permissions.push({
            roleId: result["roleId"],
            action: result["action"],
            subject: result["subject"],
            subjectName: result["subjectName"],
            conditions: createReadableConditions(result["conditions"]),
        })
    }
    return permissions
}

async function getRoles(request: CoreRequest): Promise<CoreResponse> {
    const user = await getUsersFromDatabase(request.connectionId, request.username)

    const roles: number[] = []
    if (request.project == GLOBAL_PERMISSION) {
        roles.push(user[0].globalRoleId)
        return roles
    }

    const result = await plugins.events.request(
        select(request.connectionId, request.project + "_users", {
            columns: ["roleid"],
            condition: [{ userid: user[0].id }],
        })
    )

    for (const r of result) {
        roles.push(r.roleId)
    }

    return roles
}

async function getProjectUsers(request: CoreRequest): Promise<CoreResponse> {
    const table = getTableName(request.project, "users")
    const users = await plugins.events.request(
        select(request.connectionId, table, {
            columns: ["_id", "globalRoleId", "roleId", "userId", "username"],
            join: {
                table: "users",
                on: [`${table}.userId`, `users._id`],
            },
        })
    )
    console.log("users: ", users)
    return users
}

async function getUsersFromDatabase(connectionId: string, username: string): Promise<CoreResponse> {
    return await plugins.events.request(
        select(connectionId, "users", { condition: [{ username: username }] })
    )
}

async function checkIfPermissionExists(
    connectionId: any,
    table: string,
    roleId: number,
    action: string,
    subject: string
): Promise<boolean> {
    const rows = await plugins.events.request(
        select(connectionId, table, {
            condition: [{ roleId: roleId, action: action, subject: subject }],
        })
    )
    return rows.length != 0
}

export function getTableName(project: string, table: string): string {
    if (project == "") {
        return table
    }

    return "p" + project + "_" + table
}

async function createPermissionTablesInProject(notification: CoreNotification) {
    const projectName = notification.newProject
    const projects: ProjectDescriptor[] = await plugins.events.request(
        getProjects(connectionId, ROLE_ID)
    )

    // @ts-ignore
    const projectId: number = projects.find(p => p.name == projectName).id

    const permissionsTable = getTableName(projectId.toString(), "permissions")
    const usersTable = getTableName(projectId.toString(), "users")
    const rolesTable = getTableName(projectId.toString(), "roles")

    await plugins.events.request(
        createTable(connectionId, permissionsTable, PERMISSIONS_TABLE_STRUCTURE)
    )
    await plugins.events.request(
        rawQuery(
            connectionId,
            "ALTER TABLE " +
                permissionsTable +
                ' ADD PRIMARY KEY ("roleId", action, subject, "subjectName");'
        )
    )

    await plugins.events.request(
        createTable(connectionId, usersTable, [
            {
                name: "userid",
                type: ColumnType.integer,
            },
            {
                name: "roleid",
                type: ColumnType.integer,
            },
        ])
    )

    await plugins.events.request(
        createTable(connectionId, rolesTable, [
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

    // TODO set owner and inital permissions
}
