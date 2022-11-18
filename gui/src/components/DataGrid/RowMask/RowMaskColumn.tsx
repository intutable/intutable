import cells from "@datagrid/Cells"
import { ColumnAttributesWindow } from "@datagrid/renderers/HeaderRenderer/ColumnAttributesWindow"
import EditIcon from "@mui/icons-material/Edit"
import KeyIcon from "@mui/icons-material/Key"
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import React, { useState } from "react"
import { Column } from "types"

const ColumnAttributesWindowButton: React.FC<{
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
            <IconButton onClick={openContextMenu} size="small" color="primary">
                <EditIcon fontSize="small" />
            </IconButton>
            <ColumnAttributesWindow open={anchorEL != null} onClose={closeContextMenu} column={column} />
        </>
    )
}

const getExposedInput = (type: Column.Serialized["cellType"]) => {
    const cellUtil = cells.getCell(type)
    return cellUtil.ExposedInput
}

export const RowMaskColumn: React.FC<{ column: Column.Deserialized }> = ({ column }) => {
    const theme = useTheme()
    const { rowMaskState, setRowMaskState } = useRowMask()

    const util = cells.getCell(column.cellType!)
    const Icon = util.icon
    const Input = getExposedInput(column.cellType)

    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (
        <>
            <Box
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                sx={{
                    bgcolor: isHovering ? theme.palette.grey[100] : "inherit",
                    borderRadius: theme.shape.borderRadius,
                    mb: 2,
                    px: 3,
                    py: 1.5,
                    boxSizing: "border-box",
                }}
            >
                <Stack
                    direction={column.isUserPrimaryKey === true ? "column" : "row"}
                    sx={{
                        flexWrap: "nowrap",

                        alignItems: column.isUserPrimaryKey ? "flex-start" : "center",
                    }}
                >
                    <Typography
                        sx={{
                            width: "150px",
                            maxWidth: "150px",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            mr: 6,
                            textAlign: "right",
                        }}
                        variant="subtitle1"
                    >
                        {column.isUserPrimaryKey === true && <KeyIcon fontSize="small" />}
                        <Icon
                            fontSize="small"
                            sx={{
                                mr: 1,
                            }}
                        />
                        {column.name}
                    </Typography>

                    {rowMaskState.mode === "edit" && (
                        // TODO: if `create`, then create an empty row and open it
                        <Input content={rowMaskState.row[column.key]} row={rowMaskState.row} column={column} />
                    )}

                    <Box sx={{ flexGrow: 1 }} />
                    {isHovering && <ColumnAttributesWindowButton column={column as Column.Serialized} />}
                </Stack>
            </Box>

            {column.isUserPrimaryKey === true && <Divider variant="middle" sx={{ mt: 2, mb: 8 }} />}
        </>
    )
}
