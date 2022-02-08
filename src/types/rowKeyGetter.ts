import type { Row } from "@app/types/types"
import { __KEYS__ } from "@app/types/types"
import React from "react"

/**
 * Returns the id of a row, which DataGrid needs for indexing.
 * @param row
 * @returns
 */
export const rowKeyGetter = (row: Row): React.Key => row[__KEYS__.RDG_ID_KEY]
