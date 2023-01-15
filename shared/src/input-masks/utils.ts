import { ColumnGroup } from "./types"

export type TableIdOrigin = { tableId: number }
export type TableNameOrigin = { tableName: string }
export type TableOrigin = TableIdOrigin | TableNameOrigin

export type ViewIdOrigin = { viewId: number }
export type ViewNameOrigin = { viewName: string; viewsTableName: string }
export type ViewOrigin = ViewIdOrigin | ViewNameOrigin

export type Origin = TableOrigin | ViewOrigin

export const isTableIdOrigin = (value: Origin): value is TableIdOrigin =>
    Object.prototype.hasOwnProperty.call(value, "tableId")
export const isTableNameOrigin = (value: Origin): value is TableNameOrigin =>
    Object.prototype.hasOwnProperty.call(value, "tableName")

export const isViewIdOrigin = (value: Origin): value is ViewIdOrigin =>
    Object.prototype.hasOwnProperty.call(value, "viewId")
export const isViewNameOrigin = (value: Origin): value is ViewNameOrigin =>
    Object.prototype.hasOwnProperty.call(value, "viewName") &&
    Object.prototype.hasOwnProperty.call(value, "viewsTableName")

/** type guard for ColumnGroup */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isColumnGroup = (value: any): value is ColumnGroup =>
    Object.prototype.hasOwnProperty.call(value, "columns") &&
    Object.prototype.hasOwnProperty.call(value, "index") &&
    Array.isArray(value.columns)

export type ColumnIdOrigin = { id: number }
export type ColumnNameOrigin = { name: string }
export type ColumnOrigin = ColumnIdOrigin | ColumnNameOrigin

export const isColumnIdOrigin = (value: ColumnOrigin): value is ColumnIdOrigin =>
    Object.prototype.hasOwnProperty.call(value, "id")
