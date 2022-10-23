import { ColumnInfo } from "@intutable/lazy-views/dist/types"

export const isInternalColumn = (column: ColumnInfo): boolean =>
    column.name === "_id"
