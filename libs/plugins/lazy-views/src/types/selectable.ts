/**
 * A common interface dealing with tables and views as something that can be
 * selected from.
 * We refer to the selectable that a view selects from as its "source".
 * @module types.selectable
 */
import { TableDescriptor, ViewDescriptor } from "./main"

export enum SelectableType {
    Table,
    View,
}
/**
 * Describes all data types that have the "is a table or a view" property.
 * for instance, one can specify the source for a view as either a table or a
 * view by means of {@link SelectableSpecifier}. WARNING: make sure to use
 * `type` and `interface` correctly, or else the type inference for the
 * convenience functions in {@link selectable}` won't work:
 * @example
 * ```
 * type SelectableId = Selectable<TableId, ViewId> // type, not interface
 * interface TableId { ... } // must be interfaces, not type aliases
 * interface ViewId { ... }
 * ```
 * Now, you can use {@link selectable.isTable} and {@link selectable.asTable}
 * on `SelectableId`.
 */
export interface Selectable<T, V> {
    type: SelectableType
}
/**
 * An ID number, tagged with a {@link SelectableType}, for use when creating
 * views.
 */
export type SelectableSpecifier = Selectable<SourceTableSpecifier, SourceViewSpecifier>
/** Tagged ID of a table. */
export interface SourceTableSpecifier extends SelectableSpecifier {
    id: number
}
/** Tagged ID of a view. */
export interface SourceViewSpecifier extends SelectableSpecifier {
    id: number
}

/**
 * Basic descriptor (ID, name) of a table/view. {@link SelectableSpecifier}
 * is used for creating a view, while this type is returned from e.g.
 * {@link requests.getViewInfo}.
 */
export type SelectableDescriptor = Selectable<SourceTableDescriptor, SourceViewDescriptor>
/** Tagged descriptor of a table. */
export interface SourceTableDescriptor extends SelectableDescriptor {
    table: TableDescriptor
}
/** Tagged descriptor of a view. */
export interface SourceViewDescriptor extends SelectableDescriptor {
    view: ViewDescriptor
}
