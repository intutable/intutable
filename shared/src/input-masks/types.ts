import { SerializedColumn, SerializedViewData } from "../types/tables/serialized"

export type Comment = {
    text: string
    user: string
    created: Date
    /** @default false */
    highlighted?: boolean
}

export type FlexboxSizing = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12"

export type ColumnGroup = Array<{
    columnId: number
    size: FlexboxSizing
    /** It will use the first column's index where this is 'true' to position the group. */
    useIndex: boolean
}>

export type InputMaskColumn = {
    /** @default false */
    inputRequired?: boolean
}
export type OverridenColumn = SerializedColumn & InputMaskColumn

export type Rule = unknown

export type InputMask = {
    /** unique identifier; pass a uuuidv4 to this */
    id: string
    /** specifiy a view's id oder a table's id */
    origin: { viewId: number } | { tableId: number }
    name: string
    description: string
    created: Date
    lastEdited: Date
    comments: Comment[]
    active: boolean
    groups: ColumnGroup[]
    columnProps: OverridenColumn[]
    rules: Rule[]
}

export type UNSAFE_ViewData = SerializedViewData & { inputMasks: InputMask[] }
