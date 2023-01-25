import { cellMap } from "@datagrid/Cells"
import { ColumnAttributesWindow } from "@datagrid/renderers/HeaderRenderer/ColumnAttributesWindow"
import EditIcon from "@mui/icons-material/Edit"
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import React, { useEffect, useRef, useState } from "react"
import { Column } from "types"
import KeyIcon from "@mui/icons-material/Key"

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
    const [isHovering, setIsHovering] = useState<boolean>(false)
    const { rowMaskState, appliedInputMask: selectedInputMask } = useRowMask()
    const isInputMask = selectedInputMask !== null

    const cell = cellMap.instantiate(column)
    const Icon = cell.icon
    const Input = cell.ExposedInput

    if (rowMaskState.mode !== "edit") return null

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
                    <Input
                        content={rowMaskState.row[column.key]}
                        row={rowMaskState.row}
                        column={column}
                        hoveringOnParent={isHovering}
                    />

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
