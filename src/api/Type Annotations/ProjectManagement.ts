/**
 * Type Annotations for `project-management` Plugin.
 *
 * This is only temporarily needed. Once PM supports adding meta properties,
 * this will be obsolete. (Then this will be more like a Schema.)
 */

export namespace ProjectManagement {
    // ################################ Project ################################
    export namespace Project {
        export type ID = number
        export type Name = string
        export type List = Project[]
    }
    export type Project = {
        projectId: Project.ID
        projectName: Project.Name
    }

    // ################################ Table ################################
    export namespace Table {
        export type ID = number
        export type Name = string
        export type List = Table[]
    }
    export type Table = {
        tableId: Table.ID
        tableName: Table.Name
    }

    // ################################ Column ################################
    export namespace Column {
        export type ID = number
        export type Name = string
        export type List = Column[]
    }
    export type Column = {
        columnId: Column.ID
        columnName: Column.Name
    }

    // ################################ Column ################################
    export namespace SerializedServerResponse {
        export type Table = {
            table: ProjectManagement.Table
            columns: {
                _id: number
                columnName: string
                editable: boolean
                hidden: boolean
                type: string
            }[]
            rows: Record<string, unknown>[]
        }
    }
}
