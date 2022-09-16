import { ColumnInfo } from "@intutable/lazy-views"

export type ExportOptions = {
    columnSelection: ColumnInfo["id"][]
    rowSelection?: number[]
    includeEmptyRows?: boolean
    includeHeader?: boolean
}

export type ExportRequest = {
    date: Date
    options: ExportOptions
    file: {
        name: string
        format: "csv"
        excludeDateString?: boolean
    }
}
