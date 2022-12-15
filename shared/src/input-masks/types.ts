export type Comment = { text: string; user: string; created: Date }

export type FlexboxSizing = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12"
export type ColumnGroup = Array<{
    column: number
    size: FlexboxSizing
}>

type OriginTypeMap = {
    view: { __type: "view"; viewId: number }
    table: { __type: "table"; tableId: number }
}

export type OverridenColumn = Record<string, unknown>
export type Rule = unknown

/** ORIGIN type narrowing */
export type InputMask<ORIGIN extends "view" | "table"> = {
    id: string
    origin: OriginTypeMap[ORIGIN]
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
