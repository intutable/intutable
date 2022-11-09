import { Column, Row } from "types"

export type InterdependentAttributes = "kind"
// export type InterdependentAttributes = "editor" | "kind" | "formatter"
export type ReadonlyAttributes = "id"

export type SettableAttributes = keyof Exclude<
    Column.Serialized,
    InterdependentAttributes | ReadonlyAttributes
>

export type DefaultColumnOptions<T> = Record<string, never>

/**
 * Our version of the default props for some properties of {@link SerializedColumn}.
 */
export const SerializedColumnDefaultValues: Partial<Column.Serialized> = {
    kind: "standard",
    width: undefined,
    editable: true,
    frozen: false,
    resizable: true,
    sortable: true,
} as const

/**
 * ### ColumnFactory class
 *
 * helps when creating columns by proper setting its attributes
 */
export class ColumnFactory {
    public readonly column: Column.Serialized = ColumnFactory.DefaultColumn()

    constructor() {}

    static DefaultColumn(): Exclude<Column.Serialized, "id"> {
        throw Error("not defined")
    }

    // TODO: use this in rdg
    static DefaultColumnOptions(): DefaultColumnOptions<Row> {
        return {}
    }

    setInterdependentAttribute<T extends InterdependentAttributes>(
        attribute: T,
        value: Column.Serialized[T]
    ) {
        switch (attribute) {
            case "kind":
            case "editor":
            case "formatter":
                break

            default:
                break
        }
    }

    setAttribute<T extends SettableAttributes>(
        attribute: T,
        value: Column.Serialized[T]
    ) {
        this.column[attribute] = value
    }
}
