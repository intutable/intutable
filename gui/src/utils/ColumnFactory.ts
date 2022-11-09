import { Column, Row } from "types"

type ColumnFactoryOptionalAttributes = Omit<
    Column.Serialized,
    "_kind" | "_cellContentType" | "name" | "_id" | "key"
>

const ColumnFactoryDefaultAttributes: ColumnFactoryOptionalAttributes = {
    width: undefined,
    minWidth: undefined,
    maxWidth: undefined,
    cellClass: undefined,
    headerCellClass: undefined,
    summaryCellClass: undefined,
    summaryFormatter: undefined,
    groupFormatter: undefined,
    editable: true,
    colSpan: undefined,
    frozen: false,
    resizable: true,
    sortable: true,
    sortDescendingFirst: undefined,
    index: null,
} as const
const DefaultAttributes = (options?: {
    omit: (keyof ColumnFactoryOptionalAttributes)[]
}) => {
    if (options == null) return ColumnFactoryDefaultAttributes
    const result = { ...ColumnFactoryDefaultAttributes }
    for (const key of options.omit) {
        delete result[key]
    }
    return result
}

type FactoryColumn = Omit<Column.Serialized, "_id" | "key">

export abstract class ColumnFactory<A = ColumnFactoryOptionalAttributes> {
    // following properties are required, others have default values
    public abstract readonly kind: Column.Serialized["kind"]
    public abstract readonly cellContentType: Column.Serialized["cellType"]
    public abstract readonly name: Column.Serialized["name"]

    // optional properties
    public abstract attributes: A

    public abstract create(): FactoryColumn

    /** Includes rules wether the props can be changed */
    // public abstract update(column: Partial<FactoryColumn>): FactoryColumn
}

type IndexColumnOptionalAttributes = Omit<
    ColumnFactoryOptionalAttributes,
    "editable" | "resizable" | "__columnIndex__"
>
export class IndexColumn extends ColumnFactory<IndexColumnOptionalAttributes> {
    // required properties
    readonly kind = "index"
    readonly cellContentType = "number"
    readonly name = "Index"
    // default values for this class
    readonly editable: Column.Serialized["editable"] = false
    readonly resizable: Column.Serialized["resizable"] = false
    readonly __columnIndex__ = null

    constructor(
        public attributes: IndexColumnOptionalAttributes = DefaultAttributes({
            omit: ["editable", "resizable", "index"],
        })
    ) {
        super()
    }
        switch (attribute) {
            case "kind":
            case "editor":
            case "formatter":
                break

    create(): FactoryColumn {
        return {
            _kind: this.kind,
            _cellContentType: this.cellContentType,
            name: this.name,
            editable: this.editable,
            resizable: this.resizable,
            __columnIndex__: this.__columnIndex__,
            ...this.attributes,
        }
    }
}

export class StandardColumn extends ColumnFactory {
    // required properties
    readonly kind: Column.Serialized["_kind"] = "standard"
    readonly cellContentType: Column.Serialized["_cellContentType"]
    readonly name: Column.Serialized["name"]

    constructor(
        name: Column.Serialized["name"],
        cellContentType: Column.Serialized["_cellContentType"],
        public attributes: ColumnFactoryOptionalAttributes = DefaultAttributes()
    ) {
        super()
        this.cellContentType = cellContentType
        this.name = name
    }

    create(): FactoryColumn {
        return {
            _kind: this.kind,
            _cellContentType: this.cellContentType,
            name: this.name,
            ...this.attributes,
        }
    }
}

// class LinkColumn extends ColumnFactor
// class LookupColumn extends ColumnFactor
