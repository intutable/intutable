import type { Row } from "types"

/**
 * Returns the id of a row, which DataGrid needs for indexing.
 * @param row
 * @returns
 */
export const rowKeyGetter = (row: Row): number => row.index
