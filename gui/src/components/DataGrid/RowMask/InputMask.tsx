import type { ColumnGroup } from "@shared/input-masks/types"
import { isColumnGroup, isColumnIdOrigin } from "@shared/input-masks/utils"
import { useInputMask } from "hooks/useInputMask"
import { Column } from "types/tables/rdg"
import { RowMaskColumn } from "./Column"
import { ColumnGroupComponent } from "./ColumnGroup"
import { merge, MergedColumn } from "./merge"

const columnIsInGroup = (column: Column, groups: ColumnGroup[]) =>
    groups.some(group =>
        group.columns.some(groupColumn =>
            isColumnIdOrigin(groupColumn) ? groupColumn.id === column.id : groupColumn.name === column.name
        )
    )

const OrderedColumnMapSort = (a: Column | ColumnGroup | MergedColumn, b: Column | ColumnGroup | MergedColumn) => {
    // special case: groups override column indices if they use the same index
    if (
        ((isColumnGroup(a) && isColumnGroup(b) === false) || (isColumnGroup(b) && isColumnGroup(a) === false)) && // one group AND one column in a/b
        a.index === b.index // that share the same index
    )
        return isColumnGroup(a) ? 1 : -1

    return a.index > b.index ? 1 : -1
}

const orderColumnsAndGroups = (columns: Column[], groups: ColumnGroup[]): (Column | ColumnGroup)[] => {
    // filter out columns that are in a group
    const nonGroupedColumns = columns.filter(column => columnIsInGroup(column, groups) === false)

    // combine left over columns w/ groups
    const columnsAndGroups = [...nonGroupedColumns, ...groups]

    // return them sorted
    return columnsAndGroups.sort(OrderedColumnMapSort)
}

// const mergeColumns

/** 'columns' should be already filterd by userPrimaryKey-columns and hiddens ones */
export const MakeInputMaskColumns: React.FC<{ columns: Column[] }> = ({ columns }) => {
    const { currentInputMask } = useInputMask()

    if (currentInputMask == null) return null

    const mergedColumns = merge(columns, currentInputMask.columnProps)
    const orderedColumns = orderColumnsAndGroups(mergedColumns, currentInputMask.groups)

    return (
        <>
            {orderedColumns.map(item =>
                isColumnGroup(item) ? (
                    <ColumnGroupComponent
                        key={item.index}
                        group={item}
                        columns={columns.filter(column => columnIsInGroup(column, [item]))}
                    />
                ) : (
                    <RowMaskColumn key={item.index} column={item} />
                )
            )}
        </>
    )
}
