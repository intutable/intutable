import { cellMap } from "@datagrid/Cells"
import { Badge, Box, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import type { ColumnGroup } from "@shared/input-masks/types"
import { isColumnIdOrigin } from "@shared/input-masks/utils"
import { useRowMask } from "context/RowMaskContext"
import { useInputMask } from "hooks/useInputMask"
import React, { useMemo, useState } from "react"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import InfoIcon from "@mui/icons-material/Info"
import { useView } from "hooks/useView"
import { MergedColumn } from "./mergeInputMaskColumn"
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown"
import { checkRequiredInputs } from "hooks/useCheckRequiredInputs"

export type ColumnGroupComponent = {
    group: ColumnGroup
    /** columns in that group */
    columns: MergedColumn[]
}
export const ColumnGroupComponent: React.FC<ColumnGroupComponent> = ({ columns, group }) => {
    const theme = useTheme()
    const { row, inputMask } = useRowMask()
    const { data: view } = useView({
        swrOptions: {
            // revalidateOnMount: false,
            // revalidateIfStale: false,
        },
    })

    const collapsable = group.collapsable ?? false
    const [collapsed, setCollapsed] = useState<boolean>(group.collapsed ?? false)

    const missingRequiredInputsInGroup = useMemo(() => {
        if (!view || !row || !inputMask) return null
        const missing = checkRequiredInputs(inputMask, row, columns)
        return missing
    }, [columns, inputMask, row, view])

    if (!row || !inputMask) return null

    return (
        <Box
            sx={{
                bgcolor: "inherit",
                "&:hover": {
                    bgcolor: theme.palette.action.hover,
                },
                borderRadius: theme.shape.borderRadius,
                mb: 3,
                px: 3,
                py: 2,
                boxSizing: "border-box",
            }}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    width: "100%",
                    mb: collapsed ? 0 : 3,
                }}
            >
                <Badge
                    badgeContent={missingRequiredInputsInGroup?.length}
                    color="error"
                    invisible={collapsed === false || missingRequiredInputsInGroup?.length === 0}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mr: 0.5,
                        }}
                        color={
                            missingRequiredInputsInGroup && missingRequiredInputsInGroup.length > 0
                                ? "error"
                                : "text.primary"
                        }
                    >
                        {group.label}
                    </Typography>
                </Badge>
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
                <Box flexGrow={1} />
                {collapsable && (
                    <IconButton size="small" onClick={() => setCollapsed(prev => !prev)}>
                        <ExpandCircleDownIcon
                            fontSize="small"
                            sx={{
                                transform: collapsed ? undefined : "rotate(180deg)",
                            }}
                        />
                    </IconButton>
                )}
            </Stack>

            {(collapsed === false || collapsable === false) && (
                <Grid container spacing={1}>
                    {columns.sort(ColumnUtility.sortByIndex).map(column => {
                        const cell = cellMap.instantiate(column)
                        // const Icon = cell.icon
                        const Input = React.memo(cell.ExposedInput)

                        const groupCol = group.columns.find(col =>
                            isColumnIdOrigin(col) ? col.id === column.id : col.name === column.name
                        )
                        if (groupCol === undefined)
                            throw new Error("Could not find the column in the group!")

                        const selectedRow = row

                        return (
                            <Grid
                                item
                                xs={parseInt(groupCol.size)}
                                key={column.id}
                                sx={{
                                    overflow: "hidden",
                                }}
                            >
                                <Input
                                    content={selectedRow[column.key]}
                                    row={selectedRow}
                                    column={column}
                                    placeholder={column.inputPlaceholderText}
                                    label={
                                        column.suppressInputLabel !== true
                                            ? (column.name as string)
                                            : undefined
                                    }
                                    required={column.inputRequired}
                                />
                            </Grid>
                        )
                    })}
                </Grid>
            )}
        </Box>
    )
}
