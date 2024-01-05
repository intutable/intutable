export interface PermissionResult {
    isAllowed: boolean
    conditions: string[]
}

export interface PermissionEntry {
    roleId: number,
    action: string,
    subject: string,
    subjectName: string,
    conditions: string[]
}