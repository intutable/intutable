import { ColumnSpecifier, ViewColumnId, JoinId, JoinDescriptor } from "."
import { SelectableSpecifier } from "./selectable"

/**
 * Link between a view column and its underlying column, bundling all
 * foreign keys (view, parent column, join) in one object.
 * Used directly only in internal implementation. Publicly, only its
 * subtype {@link ColumnInfo} is exposed.
 */
export interface ColumnDescriptor extends ColumnSpecifier {
    /** Which view the column belongs to. @deprecated */
    viewId: number
    /** The column's unique ID. */
    id: ViewColumnId
    /** Which join(ed table) this column comes from. */
    joinId: JoinId
}

/**
 * A view is defined on multiple sources (tables/views). In building the tree
 * for a view, we go through each of these and select their columns; this type
 * collects the information needed to select one of these "groups":
 * the base source's columns need only the {@link SelectableSpecifier},
 * the joins' columns the {@link JoinDescriptor}
 */
export type ColumnGroupSpecifier =
    | SelectableSpecifier
    | Pick<JoinDescriptor, "id" | "foreignSource">
