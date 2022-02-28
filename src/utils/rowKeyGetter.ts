import type { Row } from "types"
import React from "react"

/**
 * Returns the id of a row, which DataGrid needs for indexing.
 * @param row
 * @returns
 */
export const rowKeyGetter = (row: Row): React.Key => row.__rowIndex__
