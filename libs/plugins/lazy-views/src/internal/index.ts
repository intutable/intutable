import { ColumnDescriptor, ColumnGroupSpecifier } from "../types/internal"

import { JoinId, ColumnInfo, ParentColumnDescriptor } from "../types"
import { SelectableSpecifier } from "../types/selectable"
import { VIEW_COLUMNS_ATTRIBUTES } from "../meta"

/**
 *  Merge a column descriptor (minimal identifying data) with its parent
 * column to create a {@link ColumnInfo} (all metadata, part of public API)
 * object.
 */
export function makeColumnInfo(
    column: ColumnDescriptor,
    parentColumn: ParentColumnDescriptor
): ColumnInfo {
    return {
        ...column,
        name: parentColumn.name,
        key: makeColumnKey(column.id, parentColumn.name),
        type: parentColumn.type,
    }
}

/**
 * Given the database row for a column, extract all custom metadata, i.e. those
 * that are not defined for this plugin's internal use and that can be edited
 * with API calls like {@link ../requests/changeColumnAttribute}.
 */
export function getCustomAttributes(metaRow: Record<string, any>): Record<string, any> {
    return Object.getOwnPropertyNames(metaRow).reduce(
        (copy: Object, prop: string) =>
            VIEW_COLUMNS_ATTRIBUTES.includes(prop)
                ? copy
                : Object.assign(copy, { [prop]: metaRow[prop] }),
        {}
    )
}

/**
 * Qualify a column key by its join. The exposed column names are
 * qualified to avoid conflicts. This should only be used in the test suite,
 * as the manner in which columns are qualified is an implementation detail
 * and a module using this plugin should not make any assumptions beyond the
 * fact that a column's `key` prop and the (JS) prop key in the
 * corresponding row object will be identical.
 */
export function makeColumnKey(id: number, name: string) {
    return `c${id}_${name}`.slice(0, 63)
}
export function makeTableKey(joinId: number | null, key: string) {
    return `j${joinId === null ? "0" : joinId.toString()}_${key}`.slice(0, 63)
}

export function isBaseSource(group: ColumnGroupSpecifier): group is SelectableSpecifier {
    return group.hasOwnProperty("type")
}
export function getJoinIdFromColumnGroup(group: ColumnGroupSpecifier): JoinId {
    return isBaseSource(group) ? null : group.id
}
export function getSourceFromColumnGroup(group: ColumnGroupSpecifier): SelectableSpecifier {
    return isBaseSource(group) ? group : group.foreignSource
}
