import { cellMap } from "@datagrid/Cells"
import { ColumnAttributesWindow } from "@datagrid/renderers/HeaderRenderer/ColumnAttributesWindow"
import EditIcon from "@mui/icons-material/Edit"
import KeyIcon from "@mui/icons-material/Key"
import { Box, Divider, IconButton, InputAdornment, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import React, { useState } from "react"
import { Column } from "types"
import LinkIcon from "@mui/icons-material/Link"
import LookupIcon from "@mui/icons-material/ManageSearch"

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
            <IconButton onClick={openContextMenu} size="small" color="primary" edge="end">
                <EditIcon fontSize="small" />
            </IconButton>
            <ColumnAttributesWindow open={anchorEL != null} onClose={closeContextMenu} column={column} />
        </>
    )
}

export const RowMaskColumn: React.FC<{ column: Column.Deserialized }> = ({ column }) => {
    const theme = useTheme()
    const { rowMaskState } = useRowMask()

    const cell = cellMap.instantiate(column)
    const Icon = cell.icon
    const Input = React.memo(cell.ExposedInput)

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
                    {/* label */}
                    <Box
                        sx={{
                            ...(column.isUserPrimaryKey && {
                                width: 1,
                            }),
                        }}
                    >
                        <Stack
                            direction="row"
                            sx={{
                                mb: column.isUserPrimaryKey ? 1 : 0,
                                mr: column.isUserPrimaryKey ? 0 : 6,
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
                                    textAlign: column.isUserPrimaryKey ? "left" : "right",
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

                            {/* edit icon */}
                            {column.isUserPrimaryKey === true && (
                                <>
                                    <Box sx={{ flexGrow: 1 }} />
                                    {isHovering && (
                                        <ColumnAttributesWindowButton column={column as Column.Serialized} />
                                    )}
                                </>
                            )}
                        </Stack>
                    </Box>

                    {/* input */}

                    {rowMaskState.mode === "edit" && (
                        // TODO: if `create`, then create an empty row and open it

                        <Input
                            content={rowMaskState.row[column.key]}
                            row={rowMaskState.row}
                            column={column}
                            hoveringOnParent={isHovering}
                            InputProps={{
                                fullWidth: column.isUserPrimaryKey ? true : false,
                                InputProps: {
                                    startAdornment:
                                        column.isUserPrimaryKey === true ? (
                                            <InputAdornment position="start">
                                                <KeyIcon fontSize="small" />
                                            </InputAdornment>
                                        ) : column.kind === "lookup" ? (
                                            <InputAdornment position="start">
                                                <LookupIcon fontSize="small" />
                                            </InputAdornment>
                                        ) : column.kind === "link" ? (
                                            <InputAdornment position="start">
                                                <LinkIcon fontSize="small" />
                                            </InputAdornment>
                                        ) : null,
                                },
                            }}
                            InputStyle={{
                                w: 1,
                            }}
                        />
                    )}

                    {/* edit icon */}
                    {column.isUserPrimaryKey === false && (
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

            {column.isUserPrimaryKey === true && <Divider variant="middle" sx={{ mt: 2, mb: 8 }} />}
        </>
    )
}
