// ################################ Project ################################
export type ProjectId = number
export type ProjectName = string
export type ProjectListElement = {
    projectId: ProjectId
    projectName: ProjectName
}
export type ProjectList = ProjectListElement[]

// ################################ Table ################################
export type TableId = number
export type TableName = string
export type TableListElement = {
    tableId: TableId
    tableName: TableName
}
export type TableList = TableListElement[]

// ################################ Table ################################
export type ColumnId = number
export type ColumnName = string
export type ColumnListElement = {
    columnId: ColumnId
    columnName: ColumnName
}
export type ColumnList = ColumnListElement[]
