import { Column } from "types"

export type ColumnFactoryProps = Pick<
    Column.Serialized,
    "name" | "editable" | "frozen" | "resizable" | "sortable" | "kind"
>

export class ColumnFactory {
    constructor(properties: Column.Serialized) {}
}
