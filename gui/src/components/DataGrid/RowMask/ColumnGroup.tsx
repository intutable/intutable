import { cellMap } from "@datagrid/Cells"
import { Box, Grid, Stack, Tooltip, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import type {
    ColumnGroup,
    FlexboxSizing,
    InputMaskColumn,
    InputMaskColumnOrigin,
    InputMaskColumnProps,
} from "@shared/input-masks/types"
import { isColumnIdOrigin } from "@shared/input-masks/utils"

import { useRowMask } from "context/RowMaskContext"
import { useInputMask } from "hooks/useInputMask"
import React from "react"
import { useState } from "react"
import { Column } from "types/tables/rdg"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { RowMaskColumnBox } from "./Column"
import InfoIcon from "@mui/icons-material/Info"

type MergedColumn = Column & InputMaskColumnProps

const merge = (columns: Column[], withInputMaskColumns: InputMaskColumn[]): MergedColumn[] =>
    columns.map(column => {
        const maskCol = withInputMaskColumns.find(c =>
            isColumnIdOrigin(c.origin) ? c.origin.id === column.id : c.origin.name === column.name
        )
        if (maskCol) {
            const { origin, ...rest } = maskCol
            Object.assign(column, rest)
        }
        const merged = column as MergedColumn

        // add default values if nullish
        merged.inputRequired ??= false
        merged.suppressInputLabel ??= false

        return column
    })

export type ColumnGroupComponentProps = {
    group: ColumnGroup
    /** columns in that group */
    columns: Column[]
}
export const ColumnGroupComponent: React.FC<ColumnGroupComponentProps> = props => {
    const theme = useTheme()
    const { rowMaskState, selectedInputMask } = useRowMask()
    const { currentInputMask } = useInputMask()
    const [isHovering, setIsHovering] = useState<boolean>(false)

    if (rowMaskState.mode !== "edit" || !currentInputMask) return null

    const mergedColumns = merge(props.columns, currentInputMask.columnProps)

    return (
        <Box
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            sx={{
                bgcolor: isHovering ? theme.palette.grey[100] : "inherit",
                borderRadius: theme.shape.borderRadius,
                mb: 2,
                px: 3,
                py: props.group.label ? 4 : 1.5,
                boxSizing: "border-box",
                position: "relative",
            }}
        >
            {props.group.label && (
                <Typography
                    variant="caption"
                    fontSize="small"
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                >
                    [{props.group.label}]
                </Typography>
            )}
            <Grid container spacing={1}>
                {mergedColumns.sort(ColumnUtility.sortByIndex).map(column => {
                    const cell = cellMap.instantiate(column)
                    const Icon = cell.icon
                    const Input = React.memo(cell.ExposedInput)

                    const groupCol = props.group.columns.find(col =>
                        isColumnIdOrigin(col) ? col.id === column.id : col.name === column.name
                    )
                    if (groupCol === undefined) throw new Error("Could not find the column in the group!")

                    return (
                        <Grid item xs={parseInt(groupCol.size)} key={column.id}>
                            <Input
                                content={rowMaskState.row[column.key]}
                                row={rowMaskState.row}
                                column={column}
                                label={column.name as string}
                                hoveringOnParent={isHovering}
                                required={column.inputRequired}
                            />
                        </Grid>
                    )
                })}
            </Grid>
            {props.group.tooltip && (
                <Tooltip title={props.group.tooltip} arrow placement="right">
                    <InfoIcon />
                </Tooltip>
            )}
        </Box>
    )
}
