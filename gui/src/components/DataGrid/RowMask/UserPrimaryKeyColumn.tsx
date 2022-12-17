import { cellMap } from "@datagrid/Cells"
import { Box, Divider, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { NO_INPUT_MASK_DEFAULT, useRowMask } from "context/RowMaskContext"
import React, { useState } from "react"
import { Column } from "types"
import { ColumnAttributesWindowButton } from "./Column"

export const UserPrimaryKeyColumn: React.FC<{ column: Column.Deserialized }> = ({ column }) => {
    if (column.isUserPrimaryKey !== true)
        throw new Error("This component is supposed to be used only for user primary key columns.")

    const theme = useTheme()
    const { rowMaskState, selectedInputMask } = useRowMask()

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
                    direction="column"
                    sx={{
                        flexWrap: "nowrap",
                        alignItems: "flex-start",
                    }}
                >
                    {/* label */}
                    <Box
                        sx={{
                            width: 1,
                        }}
                    >
                        <Stack
                            direction="row"
                            sx={{
                                mb: 1,
                                mr: 0,
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
                                    textAlign: "left",
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
                            {selectedInputMask === NO_INPUT_MASK_DEFAULT && (
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
                            forwardProps={{
                                fullWidth: true,
                            }}
                            forwardSX={{
                                w: 1,
                            }}
                        />
                    )}
                </Stack>
            </Box>

            <Divider variant="middle" sx={{ mt: 2, mb: 8 }} />
        </>
    )
}
