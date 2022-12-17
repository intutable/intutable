import { cellMap } from "@datagrid/Cells"
import { ColumnAttributesWindow } from "@datagrid/renderers/HeaderRenderer/ColumnAttributesWindow"
import EditIcon from "@mui/icons-material/Edit"
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { NO_INPUT_MASK_DEFAULT, useRowMask } from "context/RowMaskContext"
import React, { useState } from "react"
import { Column } from "types"

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
type RowMaskColumnBoxProps = {
    /** Optional label – useful for groups */
    label?: string
    isHovering: boolean
    setIsHovering: React.Dispatch<React.SetStateAction<boolean>>
    children: React.ReactNode
}
export const RowMaskColumnBox: React.FC<RowMaskColumnBoxProps> = props => {
    const theme = useTheme()
    return (
        <Box
            onMouseEnter={() => props.setIsHovering(true)}
            onMouseLeave={() => props.setIsHovering(false)}
            sx={{
                bgcolor: props.isHovering ? theme.palette.grey[100] : "inherit",
                borderRadius: theme.shape.borderRadius,
                mb: 2,
                px: 3,
                py: 1.5,
                boxSizing: "border-box",
                position: "relative",
            }}
        >
            {props.isHovering && (
                <Typography
                    variant="caption"
                    fontSize="small"
                    sx={{
                        position: "absolute",
                        top: 2,
                        left: 20,
                    }}
                >
                    {props.label}
                </Typography>
            )}
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
                {props.children}
            </Stack>
        </Box>
    )
}

export const RowMaskColumn: React.FC<{ column: Column.Deserialized }> = ({ column }) => {
    if (column.isUserPrimaryKey === true)
        throw new Error("This component is supposed to be used only for columns that are NOT user primary key columns.")

    const theme = useTheme()
    const { rowMaskState, selectedInputMask } = useRowMask()

    const cell = cellMap.instantiate(column)
    const Icon = cell.icon
    const Input = React.memo(cell.ExposedInput)

    const [isHovering, setIsHovering] = useState<boolean>(false)

    return (
        <>
            <RowMaskColumnBox isHovering={isHovering} setIsHovering={setIsHovering}>
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

                {rowMaskState.mode === "edit" && (
                    <Input
                        content={rowMaskState.row[column.key]}
                        row={rowMaskState.row}
                        column={column}
                        hoveringOnParent={isHovering}
                    />
                )}

                {/* edit icon */}
                {selectedInputMask === NO_INPUT_MASK_DEFAULT && (
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
            </RowMaskColumnBox>
        </>
    )
}
