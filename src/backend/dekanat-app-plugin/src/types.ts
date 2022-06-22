import { CellContentType } from "../../../components/DataGrid/Editor/types/CellContentType"

/**
 * On creating a standard column, these are the properties that must be
 * specified.
 * TODO: make Column.Serialized a subtype of this
 */
export type StandardColumnSpecifier = {
    name: string
    _cellContentType: CellContentType
    editable: boolean
}
