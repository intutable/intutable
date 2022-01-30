import type { Row } from "@app/api/types"
import React from "react"

/**
 * Returns the id of a row
 * @param row
 * @returns
 */
export const rowKeyGetter = (row: Row): React.Key => row.__id__
