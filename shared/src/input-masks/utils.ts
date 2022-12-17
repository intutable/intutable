import { ColumnGroup } from "./types"

export type TableOrigin = { tableId: number }
export type ViewOrigin = { viewId: number }
export type Origin = TableOrigin | ViewOrigin

/** type guard for InputMask */
export const isTableOrigin = (value: Origin): value is TableOrigin =>
    Object.prototype.hasOwnProperty.call(value, "tableId")

/** type guard for ColumnGroup */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isColumnGroup = (value: any): value is ColumnGroup => {
    // use as a hint that this is a ColumnGroup
    return Object.prototype.hasOwnProperty.call(value, "columns") && Array.isArray(value.columns)
}

/** Minimum information it requires to sort */
type SortableColumn = { id: number; index: number }
/**
 * Utility that helps finding the index of a column group
 *
 * Order in which the index is 'calculated' to position the whole group:
 * 1. if a column in the group has 'useMyIndexAsGroupPosition' set to true, it uses the index of that column
 * 2. otherwise, it uses the highest index of all columns in the group
 */
export const getIndexOfGroup = (group: ColumnGroup, columns: SortableColumn[]): number => {
    const hasUseMyIndexAsGroupPosition = group.columns.find(column => column.useMyIndexAsGroupPosition)

    // the group uses the first column it finds with 'useMyIndexAsGroupPosition' set to true
    if (hasUseMyIndexAsGroupPosition) {
        const column = columns.find(column => column.id === hasUseMyIndexAsGroupPosition.id)
        if (column == null)
            throw new Error("Malformed input mask: this input mask likley specified a malformed column group!")
        return column.index
    }

    // get all columns included in the group and sort them by their index
    const columnsOfGroup = columns
        .filter(column => group.columns.map(c => c.id).includes(column.id))
        .sort((a, b) => (a.index > b.index ? 1 : -1))

    // then return the highest index, which is the first element
    return columnsOfGroup[0].index
}
