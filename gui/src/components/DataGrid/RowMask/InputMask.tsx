import type { ColumnGroup, InputMaskComponents } from "@shared/input-masks/types"
import { isColumnGroup, isColumnIdOrigin, isInputMaskComponent } from "@shared/input-masks/utils"
import { useInputMask } from "hooks/useInputMask"
import { Column } from "types/tables/rdg"
import { RowMaskColumn } from "./Column"
import { ColumnGroupComponent } from "./ColumnGroup"
import { merge, MergedColumn } from "./merge"
import Components from "./Input Mask Components"

const columnIsInGroup = (column: Column, groups: ColumnGroup[]) =>
    groups.some(group =>
        group.columns.some(groupColumn =>
            isColumnIdOrigin(groupColumn) ? groupColumn.id === column.id : groupColumn.name === column.name
        )
    )

const isColumnItem = (item: InputMaskItem): item is Column =>
    Object.prototype.hasOwnProperty.call(item, "key") &&
    Object.prototype.hasOwnProperty.call(item, "index") &&
    Object.prototype.hasOwnProperty.call(item, "name")

type InputMaskItem = Column | ColumnGroup | MergedColumn | InputMaskComponents
/**
 * ### Order and Prioritization:
 *
 * => groups > components > columns
 *
 * ### Items:
 *
 * • groups – a group of columns
 * • components – nether a column nor a group, but input mask specific things like dividers, comments, etc.
 * • columns – a regular column
 */
const OrderedInputMaskItemSort = (a: InputMaskItem, b: InputMaskItem) => {
    // case: two items share the same index and one is a column but the other item is not (which means prioritized ordering is necessary)
    if (a.index === b.index && isColumnItem(a) !== isColumnItem(b)) {
        if (isColumnGroup(a) || isColumnGroup(b)) return isColumnGroup(a) ? 1 : -1

        if (isInputMaskComponent(a) || isInputMaskComponent(b)) return isInputMaskComponent(a) ? 1 : -1

        throw new Error("Failed implementing prioritized ordering for input mask items.") // dev error
    }

    return a.index > b.index ? 1 : -1
}

/**
 * ### Orders input mask items by their indice and prioritizes.
 */
const orderInputMaskItems = (
    columns: Column[],
    groups: ColumnGroup[],
    components: InputMaskComponents[]
): InputMaskItem[] => {
    // filter out columns that are in a group
    const nonGroupedColumns = columns.filter(column => columnIsInGroup(column, groups) === false)

    // combine left over columns w/ groups and components
    const columnsAndGroups = [...nonGroupedColumns, ...groups, ...components]

    // return them sorted
    return columnsAndGroups.sort(OrderedInputMaskItemSort)
}

// const mergeColumns

/** 'columns' should be already filterd by userPrimaryKey-columns and hiddens ones */
export const MakeInputMaskColumns: React.FC<{ columns: Column[] }> = ({ columns }) => {
    const { currentInputMask } = useInputMask()

    if (currentInputMask == null) return null

    const mergedColumns = merge(columns, currentInputMask.columnProps)
    const orderedColumns = orderInputMaskItems(mergedColumns, currentInputMask.groups, currentInputMask.components)

    return (
        <>
            {orderedColumns.map(item => {
                if (isColumnGroup(item))
                    return (
                        <ColumnGroupComponent
                            key={item.index}
                            group={item}
                            columns={columns.filter(column => columnIsInGroup(column, [item]))}
                        />
                    )

                if (isInputMaskComponent(item))
                    switch (item.__component) {
                        case "divider":
                            return <Components.Divider label={item.label} />
                        case "note":
                            return <Components.Note text={item.text} headline={item.headline} />
                        default:
                            throw new Error("Unexpected input mask component")
                    }

                if (isColumnItem(item)) return <RowMaskColumn key={item.index} column={item} />

                throw new Error("Unexpected input mask item")
            })}
        </>
    )
}
