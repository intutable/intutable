import { ViewInfo } from "../types"
import * as s from "../types/selectable"

export * from "../types/selectable"

/**
 * Encapsulates the "switch/case on selectable's type" pattern. The type
 * system cannot figure out the types of the functions, so one must
 * specify their types as in:
 * @example
 * branchOnSelectable(source, (s: SourceTableDescriptor) => ...)
 */
export function branchOnSelectable<
    S extends s.Selectable<T, V>,
    T extends s.Selectable<T, V>,
    V extends s.Selectable<T, V>,
    A,
    B
>(selectable: S, tableFun: (t: T) => A, viewFun: (t: V) => B): A | B {
    if (isTable<T, V>(selectable)) {
        return tableFun(selectable)
    } else if (isView<T, V>(selectable)) {
        return viewFun(selectable)
    } else {
        throw TypeError(`object neither satisfies table nor view` + `predicate: ${selectable}`)
    }
}

/** String representation of a SelectableSpecifier, for error messages. */
export function describeSelectable(spec: s.SelectableSpecifier): string {
    return `${describeSelectableType(spec.type)} #${getSpecifierId(spec)}`
}
/** String representation of a SelectableType, for error messages. */
export function describeSelectableType(t: s.SelectableType): string {
    switch (t) {
        case s.SelectableType.Table:
            return "table"
        case s.SelectableType.View:
            return "view"
    }
}

/**
 * Wrap a number as a table ID. Needed because the plugin cannot tell from
 * plain numbers whether an ID refers to a Table or view.
 * @example
 * plugins.events.request(
 *     createView(
 *         tableId(myTable.id),
 *         "My View",
 *         ...
 *     )
 * )
 *
 */
export function tableId(id: number): s.SelectableSpecifier {
    return {
        type: s.SelectableType.Table,
        id,
    } as s.SelectableSpecifier
}

/**
 * Wrap a number as a view ID. Needed because the plugin cannot tell from
 * plain numbers whether an ID refers to a Table or view.
 * @example
 * plugins.events.request(
 *     createView(
 *         viewId(myView.id),
 *         "My Higher-Order View",
 *         ...
 *     )
 * )
 *
 */
export function viewId(id: number): s.SelectableSpecifier {
    return {
        type: s.SelectableType.View,
        id,
    } as s.SelectableSpecifier
}

/**
 * Check whether a Selectable object (SelectableId, SelectableDescriptor, ...)
 * has type table.
 */
export function isTable<T extends s.Selectable<T, V>, V extends s.Selectable<T, V>>(
    obj: s.Selectable<T, V>
): obj is T {
    return obj.type === s.SelectableType.Table
}

/**
 * Check whether a Selectable object (SelectableId, SelectableDescriptor, ...)
 * has type view.
 */
export function isView<T extends s.Selectable<T, V>, V extends s.Selectable<T, V>>(
    obj: s.Selectable<T, V>
): obj is V {
    return obj.type === s.SelectableType.View
}

/** Unsafe cast from Selectable to Table. */
export function asTable<T extends s.Selectable<T, V>, V extends s.Selectable<T, V>>(
    s: s.Selectable<T, V>
): T {
    if (isTable(s)) return s
    else throw TypeError(`expected Table, got ${JSON.stringify(s)}`)
}
/** Unsafe cast from Selectable to View. */
export function asView<T extends s.Selectable<T, V>, V extends s.Selectable<T, V>>(
    s: s.Selectable<T, V>
): V {
    if (isView(s)) return s
    else throw TypeError(`expected View, got ${JSON.stringify(s)}`)
}

/** Get the ID of a {@link SelectableSpecifier}/{@link SelectableDescriptor} */
export function getId(sel: s.SelectableSpecifier | s.SelectableDescriptor) {
    if (sel.hasOwnProperty("id")) return getSpecifierId(sel)
    else return getDescriptorId(sel)
}

// Specifier-specific functions
/** Get the ID of a {@link SelectableSpecifier}. */
export function getSpecifierId(spec: s.SelectableSpecifier): number {
    return branchOnSelectable(
        spec,
        (d: s.SourceTableSpecifier) => d.id,
        (d: s.SourceViewSpecifier) => d.id
    )
}

// descriptor-specific functions
/** Get the ID of a {@link SelectableDescriptor}. */
export function getDescriptorId(desc: s.SelectableDescriptor): number {
    return branchOnSelectable(
        desc,
        (d: s.SourceTableDescriptor) => d.table.id,
        (d: s.SourceViewDescriptor) => d.view.id
    )
}
