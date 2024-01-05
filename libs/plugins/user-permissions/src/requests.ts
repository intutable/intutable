import { CHANNEL } from "./constants"

export function can(connectionId: string, roleId: number, action: string, subject: string,
                    subjectName: string = "", project = "") {
    return {
        channel: CHANNEL,
        method: "can",
        connectionId,
        roleId,
        action,
        subject,
        subjectName,
        project
    }
}

export function set(connectionId: string, roleId: number, action: string, subject: string,
                    subjectName: string = "", conditions: string[] = [], project = "") {
    return {
        channel: CHANNEL,
        method: "set",
        connectionId,
        roleId,
        action,
        subject,
        subjectName,
        conditions,
        project
    }
}

export function unset(connectionId: string, roleId: number, action: string, subject: string,
                      subjectName: string = "", project = "") {
    return {
        channel: CHANNEL,
        method: "unset",
        connectionId,
        roleId,
        action,
        subject,
        subjectName,
        project
    }
}

export function unsetCondition(connectionId: string, roleId: number, action: string, subject: string,
                               subjectName: string = "", condition: string = "", project = "") {
    return {
        channel: CHANNEL,
        method: "unsetCondition",
        connectionId,
        roleId,
        action,
        subject,
        subjectName,
        condition,
        project
    }
}

export function setRole(connectionId: string, project: string, userId: number, roleId: number) {
    return {
        channel: CHANNEL,
        method: "setRole",
        connectionId,
        project,
        userId,
        roleId
    }
}

export function createRole(connectionId: string, project: string, description: string) {
    return {
        channel: CHANNEL,
        method: "createRole",
        connectionId,
        project,
        description
    }
}

export function deleteRole(connectionId: string, project: string, roleId: number) {
    return {
        channel: CHANNEL,
        method: "deleteRole",
        connectionId,
        project,
        roleId
    }
}

export function listRoles(connectionId: string, project: string) {
    return {
        channel: CHANNEL,
        method: "listRoles",
        connectionId,
        project
    }
}

export function revokeRole(connectionId: string, project: string, userId: number, roleId: number) {
    return {
        channel: CHANNEL,
        method: "revokeRole",
        connectionId,
        project,
        userId,
        roleId
    }
}

export function queryPermissions(connectionId: string, project: string, query: any) {
    return {
        channel: CHANNEL,
        method: "queryPermissions",
        connectionId,
        project,
        query
    }
}

export function getRoles(connectionId: string, project: string, username: string) {
    return {
        channel: CHANNEL,
        method: "getRoles",
        connectionId,
        project,
        username
    }
}

export function getProjectUsers(connectionId: string, project: string) {
    return {
        channel: CHANNEL,
        method: "getProjectUsers",
        connectionId,
        project
    }
}



