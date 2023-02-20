import { SerializedColumn, SerializedViewData } from "../types/tables/serialized"

export type Comment = {
    text: string
    user: string
    created: Date
    /** @default false */
    highlighted?: boolean
}

export type FlexboxSizing = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12"
export type ColumnGroup = {
    label: string
    tooltip?: string
    /** What index to use for the group. Can be a duplicate of any column, than it will override that index. */
    index: number
    /** @default false */
    collapsable?: boolean
    /** @default false */
    collapsed?: boolean
    columns: (
        | {
              id: number
              size: FlexboxSizing
          }
        | {
              name: string
              size: FlexboxSizing
          }
    )[]
}

export type InputMaskColumnProps = {
    /** @default false */
    inputRequired?: boolean
    tooltip?: string
    inputPlaceholderText?: string
    /** @default false */
    suppressInputLabel?: boolean
    /** @default false */
    disallowNewSelectValues?: boolean
}
export type OverrideableColumnProps = Partial<
    Pick<SerializedColumn, "name" | "editable" | "frozen" | "index" | "hidden">
>
export type InputMaskColumnOrigin = { origin: { id: number } | { name: string } }
export type InputMaskColumn = InputMaskColumnOrigin & OverrideableColumnProps & InputMaskColumnProps

export type Divider = { __component: "divider"; index: number; label?: string }
export type Note = { __component: "note"; index: number; text: string; headline?: string }
export type InputMaskComponents = Divider | Note

export type Rule = {
    [key in keyof SerializedColumn]?: Permission
}
export type Permission = unknown

export type InputMask = {
    // -- meta --
    /** unique identifier; pass a uuuidv4 to this */
    id: string
    /** specifiy a view's id oder a table's id; or for more comfort: map it to a name (unsecure) */
    // Because of changing ids through multiple dev setups and resets it is more comfortable to map to value that does not change
    // then a view requires also the table name to map
    origin:
        | { viewId: number }
        | { tableId: number }
        | { projectId: number; viewName: string; viewsTableName: string }
        | { projectId: number; tableName: string }
    name: string
    description: string
    created: Date
    lastEdited: Date
    comments: Comment[]
    active: boolean
    /** @default false */
    disabled?: boolean
    // -- actual specification --
    addRecordButtonText?: string
    addRecordButtonIcon?: string
    draftsCanBeDeleted?: boolean
    groups: ColumnGroup[]
    columnProps: InputMaskColumn[]
    components: InputMaskComponents[]
    rules: Rule[] // TODO: maybe rename to 'constraints'
}

/** only for development */
export type UNSAFE_ViewData = SerializedViewData & { inputMasks: InputMask[] }