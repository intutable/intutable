import { Column } from "types"

export type ColumnFactoryProps = Pick<Column.Serialized, "name" | "cellType">

export class ColumnFactory {
    constructor(public properties: ColumnFactoryProps) {}
    // TODO: implement
}
