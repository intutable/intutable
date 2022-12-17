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
    label?: string
    columns: {
        /** reference to the column; atm user-primary-key-columns are not allowed to be included in a group */
        id: number
        size: FlexboxSizing
        /**
         * It will use the column's indexes to order the columns in a group.
         * This can be overriden using 'overrideIndex' starting from 0.
         */
        overrideIndex?: number
        /**
         * @default false
         * It will use the first column's index where this is 'true' to position the group.
         * If no one found in a group, it uses the highest index.
         */
        useMyIndexAsGroupPosition?: boolean
    }[]
}

export type InputMaskColumn = {
    /** @default false */
    inputRequired?: boolean
}
export type OverridenColumn = SerializedColumn & InputMaskColumn

export type Rule = {
    [key in keyof SerializedColumn]?: Permission
}
export type Permission = unknown

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
