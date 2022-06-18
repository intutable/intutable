import { Column } from "types"

export type InterdependentAtributes = "editor" | "_kind" | "formatter"
export type ReadonlyAttributes = "_id"

export type SettableAttributes = keyof Exclude<
    Column.Serialized,
    InterdependentAtributes | ReadonlyAttributes
>

/**
 * Our version of the default props for some properties of {@link SerializedColumn}.
 */
export const SerializedColumnDefaultValues: Partial<Column.Serialized> = {
    _kind: "standard",
    width: undefined,
    formatter: "standard",
    editor: "string",
    editable: true,
    frozen: false,
    resizable: true,
    sortable: true,
    editorOptions: {
        renderFormatter: true, // TODO: determine the role of this property
        editOnClick: true,
        commitOnOutsideClick: true,
    },
    headerRenderer: "headerRenderer",
} as const

/**
 * ### ColumnFactory class
 *
 * helps when creating columns by proper setting its attributes
 */
export class ColumnFactory {
    public readonly column: Column.Serialized = ColumnFactory.DefaultColumn()

    constructor() {}

    static DefaultColumn(): Exclude<Column.Serialized, "_id"> {
        return {}
    }

    // TODO: use this in rdg
    static DefaultColumnOptions(): DefaultColumnOptions<Row> {}

    setInterdependentAttribute<T extends InterdependentAtributes>(
        attribute: T,
        value: Column.Serialized[T]
    ) {
        switch (attribute) {
            case "_kind":
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
