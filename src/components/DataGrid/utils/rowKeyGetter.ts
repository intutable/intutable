import { Row } from "@app/api/types"

/**
 * Returns the id of a row
 * @param row
 * @returns
 */
export const rowKeyGetter = (row: Row) => row.id
