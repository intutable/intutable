/**
 * @module requests Functions for type-safely creating requests to the plugin.
 * All writing methods send a notification. A constant for its method
 * is exported which is always the simple past of the request method
 * (e.g. createTableInProject <=> createdTableInProject) and which (as of
 * now, version 2.0.0) has the same parameters as the request, represented
 * By a matching type (type CreatedTableInProjectNotification).
 * For each method, there is a "Response: " type mentioned in the doc comment;
 * this is the type that the method's response will have.
 */

export const CHANNEL = "project-management"
import { Column, ColumnType, ColumnOption, TableOption } from "@intutable-org/database/dist/types"

/**
 * List all projects assigned to a role.
 * As of now, projects are only assigned on creation and there is no
 * way to assign them to more users.
 * Response: [ProjectDescriptor[]]{@link types.ProjectDescriptor}
 */
export function getProjects(connectionId: string, roleId: number) {
    return {
        channel: CHANNEL,
        method: "getProjects",
        connectionId,
        roleId,
    }
}

/**
 * Create a project with the given name, belonging to the given role.
 * Response: [ProjectDescriptor]{@link types.ProjectDescriptor} The ID and
 * name of the created project.
 * @param {string} newProject The name for the new project.
 */
export function createProject(connectionId: string, roleId: number, newProject: string) {
    return {
        channel: CHANNEL,
        method: "createProject",
        connectionId,
        roleId,
        newProject,
    }
}
/** Notification sent after a project is created. */
export const createdProject = "createdProject"
/** Notification sent after a project is created. */
export type CreateProjectNotification = ReturnType<typeof createProject>

/**
 * Rename a project.
 * Response: [ProjectDescriptor]{@link types.ProjectDescriptor} The descriptor
 * (name + ID) of the newly renamed project
 */
export function changeProjectName(connectionId: string, id: number, newName: string) {
    return {
        channel: CHANNEL,
        method: "changeProjectName",
        connectionId,
        id,
        newName,
    }
}
/** Notification sent after a project is renamed. */
export const changedProjectName = "changedProjectName"
/** Notification sent after a project is renamed. */
export type ChangedProjectNameNotification = ReturnType<typeof changeProjectName>

/**
 * Delete a project, and all its tables except the ones specified
 * in `tablesToKeep`.
 * Response: { message: string } A report that the project was deleted.
 * @param {number[]} tablesToKeep The IDs of all tables that should not be
 * deleted.
 */
export function removeProject(connectionId: string, id: number, tablesToKeep: number[] = []) {
    return {
        channel: CHANNEL,
        method: "removeProject",
        connectionId,
        id,
        tablesToKeep,
    }
}
/** Notification sent after a project is deleted. */
export const removedProject = "removedProject"
/** Notification sent after a project is deleted. */
export type RemovedProjectNotification = ReturnType<typeof removeProject>

/**
 * List tables belonging to a project
 * Response: [TableDescriptor[]]{@link types.TableDescriptor}
 * @param {number} id The ID of the project.
 */
export function getTablesFromProject(connectionId: string, id: number) {
    return {
        channel: CHANNEL,
        method: "getTablesFromProject",
        connectionId,
        id,
    }
}

/**
 * Create a new table assigned to a project and a role, optionally with
 * some initial columns.
 * Response: [TableDescriptor]{@link types.TableDescriptor}
 * @param {number} roleId The role:project and project:table relations are
 * (intended to be) n:m, but we additionally store the single "owner" for
 * each project (may be useful for privileged access and stuff eventually...?)
 */
export function createTableInProject(
    connectionId: string,
    roleId: number,
    projectId: number,
    name: string,
    columns: Column[] = [],
    options: TableOption[] = []
) {
    return {
        channel: CHANNEL,
        method: "createTableInProject",
        connectionId,
        roleId,
        projectId,
        name,
        columns,
        options,
    }
}
/** Notification sent after a table is created. */
export const createdTableInProject = "createdTableInProject"
/** Notification sent after a project is deleted. */
export type CreatedTableInProjectNotification = ReturnType<typeof createTableInProject>

/**
 * Rename a table.
 * Response: [TableDescriptor]{@link types.TableDescriptor} The descriptor
 * of the updated table.
 */
export function changeTableName(connectionId: string, id: number, newName: string) {
    return {
        channel: CHANNEL,
        method: "changeTableName",
        connectionId,
        id,
        newName,
    }
}
/** Notification sent after a table is renamed. */
export const changedTableName = "changedTableName"
/** Notification sent after a table is renamed. */
export type ChangedTableNameNotification = ReturnType<typeof changeTableName>

/**
 * Delete a table and all its metadata.
 * Response: { message: string } a report of what happened.
 */
export function removeTable(connectionId: string, id: number) {
    return {
        channel: CHANNEL,
        method: "removeTable",
        connectionId,
        id,
    }
}
/** Notificaiton sent after a table is deleted. */
export const removedTable = "removedTable"
/** Notificaiton sent after a table is deleted. */
export type RemovedTableNotification = ReturnType<typeof removeTable>

/**
 * Get metadata of a table: name, key, column info. Should be the same as
 * {@link getTableData} except without the rows of the object table.
 * Response: [TableInfo]{@link types.TableInfo}
 * @param {string[]} attributes which of the columns' custom metadata
 * attributes to fetch (all of them by default, and there is probably no
 * need to ever specify different ones)
 * See {@link changeColumnAttributes} for more information.
 */
export function getTableInfo(connectionId: string, id: number, attributes: string[] = []) {
    return {
        channel: CHANNEL,
        method: "getTableInfo",
        connectionId,
        id,
        attributes,
    }
}

/**
 * Get full data of a table: Its [TableInfo]{@link getTableInfo} plus
 * The rows stored in the table.
 * Response: [TableData<Record<string,unknown>>]{@link types.TableData}
 * @param {string[]} attributes see {@link getTableInfo}.
 */
export function getTableData(connectionId: string, id: number, attributes: string[] = []) {
    return {
        channel: CHANNEL,
        method: "getTableData",
        connectionId,
        id,
        attributes,
    }
}

/**
 * Get columns of a table. Always includes the basic properties ID,
 * name, and type. The `attributes` prop of each column will contain
 * the attributes given in the `attributes` argument to the method, or all
 * of them, if `attributes` is empty.
 * See {@link changeColumnAttributes} for more information.
 * Response: [ColumnDescriptor[]]{@link types.ColumnDescriptor}
 */
export function getColumnsFromTable(connectionId: string, id: number, attributes: string[] = []) {
    return {
        channel: CHANNEL,
        method: "getColumnsFromTable",
        connectionId,
        id,
        attributes,
    }
}

/**
 * Create a new column in a given table.
 * Response: [ColumnDescriptor]{@link types.ColumnDescriptor}
 * @param attributes initial values for the column's custom attributes.
 * See {@link changeColumnAttributes} for more information.
 */
export function createColumnInTable(
    connectionId: string,
    tableId: number,
    name: string,
    type: ColumnType = ColumnType.string,
    options: ColumnOption[] = [],
    attributes: Record<string, any> = {}
) {
    return {
        channel: CHANNEL,
        method: "createColumnInTable",
        connectionId,
        tableId,
        name,
        type,
        options,
        attributes,
    }
}
/** Notification sent after a column is created. */
export const createdColumnInTable = "createdColumnInTable"
/** Notification sent after a column is created. */
export type CreatedColumnInTableNotification = ReturnType<typeof createColumnInTable>
/**
 * Rename a column.
 * Response: { message: string }
 */
export function changeColumnName(connectionId: string, id: number, newName: string) {
    return {
        channel: CHANNEL,
        method: "changeColumnName",
        connectionId,
        id,
        newName,
    }
}
/** Notification sent after a column is renamed. */
export const changedColumnName = "changedColumnName"
/** Notification sent after a column is renamed. */
export type ChangedColumnNameNotification = ReturnType<typeof changeColumnName>

/**
 * Change the custom metadata of a column. In addition to the basic
 * properties (name, ID, ...) extra columns may be added to the
 * `columns` table, which can then be set with this function.
 * Does not check whether the columns specified exist or the types are
 * correct, so be careful! You will get SQL errors if you mess this up.
 * The [core attributes]{@link meta.COLUMN_BASE_ATTRIBUTES} cannot be edited,
 * this will result in an exception. As of now, _which_ attributes are
 * available can only be set in the database manually.
 * Response: [ColumnDescriptor]{@link types.ColumnDescriptor} The metadata
 * of the newly updated column.
 */
export function changeColumnAttributes(
    connectionId: string,
    id: number,
    attributes: Record<string, any>
) {
    return {
        channel: CHANNEL,
        method: "changeColumnAttributes",
        connectionId,
        id,
        attributes,
    }
}
/** Notification sent after a column's attributes are changed. */
export const changedColumnAttributes = "changedColumnAttributes"
/** Notification sent after a column's attributes are changed. */
export type ChangedColumnAttributesNotification = ReturnType<typeof changeColumnAttributes>

/**
 * Delete  a column from a table.
 * Response: { message: string }
 */
export function removeColumn(connectionId: string, id: number) {
    return {
        channel: CHANNEL,
        method: "removeColumn",
        connectionId,
        id,
    }
}
/** Notification sent after a column is deleted. */
export const removedColumn = "removedColumn"
/** Notification sent after a column is deleted. */
export type RemovedColumnNotification = ReturnType<typeof removeColumn>

/**
 * Get the metadata of one column
 * Response: [ColumnDescriptor]{@link types.ColumnDescriptor}
 */
export function getColumnInfo(connectionId: string, id: number, attributes: string[] = []) {
    return {
        channel: CHANNEL,
        method: "getColumnInfo",
        connectionId,
        id,
        attributes,
    }
}

/**
 * Merge table into another one
 * column - options:
 *      intersection    (removes columns not common to both tables)
 *      target          (keeps target columns as is, default behaviour)
 *      union           (adds columns from source not in target)
 * row - options:
 *      duplicate       (copies all rows from other table, including already existing ones)
 *      ignore          (doesen't copy existing rows but ignores them instead)
 *      expand          (doesen't copy existing rows but expands them - relevant only if column-options = union)
 * Response: None
 */
export function merge(
    connectionId: string,
    source_id: number,
    target_id: number,
    column_option = "",
    row_option = ""
) {
    return {
        channel: CHANNEL,
        method: "merge",
        connectionId,
        source_id,
        target_id,
        column_option,
        row_option,
    }
}

/**
 * Copy table
 * Response: Name
 */
export function copy(connectionId: string, source_id: number, role_id: number, project_id: number) {
    return {
        channel: CHANNEL,
        method: "copy",
        connectionId,
        source_id,
        role_id,
        project_id,
    }
}
