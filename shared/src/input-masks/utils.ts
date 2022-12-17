export type TableOrigin = { tableId: number }
export type ViewOrigin = { viewId: number }
export type Origin = TableOrigin | ViewOrigin

/** type guard for InputMask */
export const isTableOrigin = (value: Origin): value is TableOrigin =>
    Object.prototype.hasOwnProperty.call(value, "tableId")
