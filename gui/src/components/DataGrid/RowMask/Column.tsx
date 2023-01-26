import { cellMap } from "@datagrid/Cells"
import { ColumnAttributesWindow } from "@datagrid/renderers/HeaderRenderer/ColumnAttributesWindow"
import EditIcon from "@mui/icons-material/Edit"
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Column } from "types"
import KeyIcon from "@mui/icons-material/Key"
import { useView } from "hooks/useView"

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
            <ColumnAttributesWindow open={anchorEL != null} onClose={closeContextMenu} column={column} />
        </>
    )
}

export const RowMaskColumn: React.FC<{ column: Column.Deserialized }> = ({ column }) => {
    const theme = useTheme()
    const { data: view } = useView()
    const [isHovering, setIsHovering] = useState<boolean>(false)
    const { rowMaskState, appliedInputMask: selectedInputMask } = useRowMask()
    const isInputMask = selectedInputMask !== null

    // BUG: this causes the input component to rerender every time a state is changed
    const cell = useMemo(() => cellMap.instantiate(column), [column])
    const Icon = React.memo(cell.icon)
    const Input = React.memo(cell.ExposedInput)

    if (rowMaskState.mode !== "edit" || view == null) return null

    const selectedRow = view.rows.find(row => row._id === rowMaskState.row._id)
    if (selectedRow == null) return null

    const content = selectedRow[column.key]

    return (
        <>
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
                    py: 1.5,
                    boxSizing: "border-box",
                    position: "relative",
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
                    <Input content={content} row={selectedRow} column={column} hoveringOnParent={isHovering} />

                    {/* edit icon */}
                    {isInputMask === false && (
                        <>
                            <Box sx={{ flexGrow: 1 }} />
                            {isHovering && (
                                <>
                                    {/* {column.kind === "link" && <AddLookupButton />} */}
                                    <ColumnAttributesWindowButton column={column as Column.Serialized} />
                                </>
                            )}
                        </>
                    )}
                </Stack>
            </Box>
        </>
    )
}
