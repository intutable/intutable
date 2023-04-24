import { cellMap } from "@datagrid/Cells"
import { ColumnAttributesWindow } from "@datagrid/renderers/HeaderRenderer/ColumnAttributesWindow"
import EditIcon from "@mui/icons-material/Edit"
import { Box, IconButton, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import { useView } from "hooks/useView"
import React, { useId, useMemo, useState } from "react"
import { Column } from "types"
import { MergedColumn } from "./mergeInputMaskColumn"

export const ColumnAttributesWindowButton: React.FC<{
    column: Column.Serialized
}> = ({ column }) => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeContextMenu = () => setAnchorEL(null)

    return (
        <>
            <IconButton onClick={openContextMenu} size="small" color="primary" edge="end">
                <EditIcon fontSize="small" />
            </IconButton>
            <ColumnAttributesWindow
                open={anchorEL != null}
                onClose={closeContextMenu}
                column={column}
            />
        </>
    )
}

export const RowMaskColumn: React.FC<{ column: MergedColumn }> = ({ column }) => {
    const theme = useTheme()
    const { data: view } = useView()
    const { row, inputMask } = useRowMask()
    const isInputMask = inputMask != null

    const cell = useMemo(() => cellMap.instantiate(column), [column])
    const Icon = React.memo(cell.icon)
    const Input = React.memo(cell.ExposedInput)

    if (!row || view == null) return null

    const selectedRow = row
    if (selectedRow == null) return null

    const content = selectedRow[column.key]

    return (
        <>
            <Box
                sx={{
                    bgcolor: "inherit",
                    "&:hover": {
                        bgcolor: theme.palette.action.hover,
                    },
                    borderRadius: theme.shape.borderRadius,
                    mb: 2,
                    px: 3,
                    py: 1.5,
                    boxSizing: "border-box",
                    position: "relative",
                    ...(isInputMask === false && {
                        "&:hover .ColumnAttributesWindowButton": {
                            display: "block",
                        },
                    }),
                }}
            >
                <Stack
                    direction="row"
                    sx={{
                        width: 1,
                        height: 1,
                        flexWrap: "nowrap",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {/* label */}
                    <Stack
                        direction="row"
                        sx={{
                            mb: 0,
                            mr: 6,
                            bosSizing: "border-box",
                        }}
                    >
                        {/* label */}
                        <Typography
                            sx={{
                                width: "150px",
                                maxWidth: "150px",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                                textAlign: "right",
                            }}
                            variant="subtitle1"
                        >
                            <Icon
                                fontSize="small"
                                sx={{
                                    mr: 1,
                                }}
                            />
                            {column.name}
                        </Typography>
                    </Stack>

                    {/* input */}
                    <Input
                        content={content}
                        row={selectedRow}
                        column={column}
                        placeholder={column.inputPlaceholderText}
                        label={
                            column.suppressInputLabel !== true ? (column.name as string) : undefined
                        }
                        required={column.inputRequired}
                    />

                    {/* edit icon */}
                    <Box
                        className="ColumnAttributesWindowButton"
                        sx={{
                            display: "none",
                        }}
                    >
                        <Box sx={{ flexGrow: 1 }} />
                        {/* {column.kind === "link" && <AddLookupButton />} */}
                        <ColumnAttributesWindowButton column={column as Column.Serialized} />
                    </Box>
                </Stack>
            </Box>
        </>
    )
}
