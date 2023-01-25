import { cellMap } from "@datagrid/Cells"
import { Box, Grid, Stack, Tooltip, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import type { ColumnGroup, FlexboxSizing, InputMaskColumnOrigin } from "@shared/input-masks/types"
import { isColumnIdOrigin } from "@shared/input-masks/utils"

import { useRowMask } from "context/RowMaskContext"
import { useInputMask } from "hooks/useInputMask"
import React from "react"
import { useState } from "react"
import { Column } from "types/tables/rdg"
import { ColumnUtility } from "utils/column utils/ColumnUtility"

import InfoIcon from "@mui/icons-material/Info"
import { merge, MergedColumn } from "./merge"

export type ColumnGroupComponent = {
    group: ColumnGroup
    /** columns in that group */
    columns: MergedColumn[]
}
export const ColumnGroupComponent: React.FC<ColumnGroupComponent> = ({ columns, group }) => {
    const theme = useTheme()
    const { rowMaskState, appliedInputMask } = useRowMask()
    const { currentInputMask } = useInputMask()
    const [isHovering, setIsHovering] = useState<boolean>(false)

    if (rowMaskState.mode !== "edit" || !currentInputMask) return null

    return (
        <Box
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            sx={{
                bgcolor: "inherit",
                "&:hover": {
                    bgcolor: theme.palette.grey[100],
                },
                borderRadius: theme.shape.borderRadius,
                mb: 2,
                px: 3,
                py: group.label ? 5 : 1.5,
                boxSizing: "border-box",
                position: "relative",
            }}
        >
            {group.label && (
                <>
                    <Stack
                        direction="row"
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="caption"
                            fontSize="small"
                            sx={{
                                mr: 0.5,
                                ml: "24px",
                            }}
                        >
                            {group.label}
                        </Typography>
                        {group.tooltip && (
                            <Tooltip title={group.tooltip} arrow placement="right">
                                <InfoIcon
                                    sx={{
                                        fontSize: "80%",
                                    }}
                                    color="disabled"
                                />
                            </Tooltip>
                        )}
                    </Stack>
                </>
            )}
            <Grid container spacing={1}>
                {columns.sort(ColumnUtility.sortByIndex).map(column => {
                    const cell = cellMap.instantiate(column)
                    const Icon = cell.icon
                    const Input = React.memo(cell.ExposedInput)

                    const groupCol = group.columns.find(col =>
                        isColumnIdOrigin(col) ? col.id === column.id : col.name === column.name
                    )
                    if (groupCol === undefined) throw new Error("Could not find the column in the group!")

                    return (
                        <Grid item xs={parseInt(groupCol.size)} key={column.id}>
                            <Input
                                content={rowMaskState.row[column.key]}
                                row={rowMaskState.row}
                                column={column}
                                placeholder={column.inputPlaceholderText}
                                label={column.suppressInputLabel !== true ? (column.name as string) : undefined}
                                hoveringOnParent={isHovering}
                                required={column.inputRequired}
                            />
                        </Grid>
                    )
                })}
            </Grid>
        </Box>
    )
}
