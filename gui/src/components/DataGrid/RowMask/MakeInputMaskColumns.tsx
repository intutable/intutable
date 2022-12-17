import type { ColumnGroup } from "@shared/input-masks/types"
import { getIndexOfGroup } from "@shared/input-masks/utils"
import { useInputMask } from "hooks/useInputMask"
import { Column } from "types/tables/rdg"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { RowMaskColumn } from "./Column"
import { GroupedColumn } from "./ColumnGroup"
/**
 * // BUG: somewhere we loose some columns
 */

type OrderedColumnMap = Map<number, { __type: "column"; column: Column } | { __type: "group"; group: ColumnGroup }>
const makeOrderedColumnMap = (columns: Column[], groups: ColumnGroup[]): OrderedColumnMap => {
    const nonGroupedColumns = columns.filter(column => columnIsInGroup(column, groups) === false)

    const columnMap = nonGroupedColumns.reduce((map: OrderedColumnMap, column) => {
        map.set(column.index, { __type: "column", column })
        return map
    }, new Map())
    const groupMap = groups.reduce((map: OrderedColumnMap, group) => {
        map.set(getIndexOfGroup(group, columns), { __type: "group", group })
        return map
    }, new Map())

    // overlapping indices -> malformed input mask
    if (Object.keys(columnMap).some(key => Object.keys(groupMap).includes(key)))
        throw new Error("A column group uses an index that is already used by an non-group column!")

    // combine and sort by index
    return new Map([...columnMap, ...groupMap].sort((a, b) => (a[0] > b[0] ? 1 : -1)))
}

const columnIsInGroup = (column: Column, groups: ColumnGroup[]) =>
    groups.some(group => group.columns.some(groupColumn => groupColumn.id === column.id))

/** 'columns' should be already filterd by userPrimaryKey-columns and hiddens ones */
export const MakeInputMaskColumns: React.FC<{ columns: Column[] }> = ({ columns }) => {
    const { currentInputMask } = useInputMask()

    if (currentInputMask == null) return null

    const orderedColumns = makeOrderedColumnMap(columns, currentInputMask.groups)

    return (
        <>
            {Array.from(orderedColumns).map(([index, columnOrGroup]) => {
                if (columnOrGroup.__type === "column")
                    return <RowMaskColumn key={index} column={columnOrGroup.column} />
                else
                    return (
                        <GroupedColumn
                            key={index}
                            group={columnOrGroup.group}
                            columns={columns.filter(column => columnIsInGroup(column, [columnOrGroup.group]))}
                        />
                    )
            })}
        </>
    )
}
