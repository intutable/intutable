export type Comment = { text: string; user: string; created: Date }

export type FlexboxSizing = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12"
export type ColumnGroup = Array<{
    column: number
    size: FlexboxSizing
}>

export type OverridenColumn = Record<string, unknown>
export type Rule = unknown

/** ORIGIN type narrowing */
export type InputMask = {
    id: string
    origin: { view: number | "*" }
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
