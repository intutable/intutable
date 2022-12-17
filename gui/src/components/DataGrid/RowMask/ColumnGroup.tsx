import { cellMap } from "@datagrid/Cells"
import { Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ColumnGroup } from "@shared/input-masks/types"
import { useRowMask } from "context/RowMaskContext"
import React from "react"
import { useState } from "react"
import { Column } from "types/tables/rdg"
import { RowMaskColumnBox } from "./Column"

const sortGroup = (group: ColumnGroup) => {}

export type GroupedColumnProps = {
    group: ColumnGroup
    /** columns in that group */
    columns: Column[]
}
export const GroupedColumn: React.FC<GroupedColumnProps> = props => {
    const theme = useTheme()
    const { rowMaskState, selectedInputMask } = useRowMask()
    const [isHovering, setIsHovering] = useState<boolean>(false)

    if (rowMaskState.mode !== "edit") return null
    return (
        <RowMaskColumnBox isHovering={isHovering} setIsHovering={setIsHovering} label={props.group.label}>
            {props.columns.map(column => {
                const cell = cellMap.instantiate(column)
                const Icon = cell.icon
                const Input = React.memo(cell.ExposedInput)

                return (
                    <Input
                        key={column.id}
                        content={rowMaskState.row[column.key]}
                        row={rowMaskState.row}
                        column={column}
                        label={column.name as string}
                        hoveringOnParent={isHovering}
                    />
                )
            })}
        </RowMaskColumnBox>
    )
}
