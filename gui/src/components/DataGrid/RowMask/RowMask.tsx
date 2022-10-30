import cells from "@datagrid/Cells"
import { AddColumnModal } from "@datagrid/Toolbar/ToolbarItems/AddCol/AddColumnModal"
import AddBoxIcon from "@mui/icons-material/AddBox"
import CloseIcon from "@mui/icons-material/Close"
import KeyIcon from "@mui/icons-material/Key"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import { StandardColumnSpecifier, useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import React, { useState } from "react"
import { Column } from "types"
import { ColumnUtility } from "utils/ColumnUtility"
import { RowNavigator } from "./RowNavigator"
import EditIcon from "@mui/icons-material/Edit"
import { ColumnContextMenu } from "@datagrid/renderers/HeaderRenderer/ColumnContextMenu"
import { ColumnAttributesWindow } from "@datagrid/renderers/HeaderRenderer/ColumnAttributesWindow"

const AddColumnButton: React.FC = () => {
    const { snackError } = useSnacki()
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAnchorEL(event.currentTarget)
    }
    const handleCloseModal = () => setAnchorEL(null)

    const { createColumn } = useColumn()

    const handleCreateColumn = async (col: StandardColumnSpecifier) => {
        try {
            await createColumn(col)
        } catch (error) {
            snackError("Die Spalte konnte nicht erstellt werden!")
        }
    }

    return (
        <>
            <Button
                onClick={handleOpenModal}
                startIcon={<AddBoxIcon fontSize="small" />}
                variant="contained"
                size="small"
                fullWidth
                color="info"
                sx={{
                    letterSpacing: 1,
                    mt: 10,
                    opacity: 0.6,
                }}
            >
                Spalte hinzufügen
            </Button>
            <AddColumnModal
                open={anchorEL != null}
                onClose={handleCloseModal}
                onHandleCreateColumn={handleCreateColumn}
            />
        </>
    )
}

const RowMaskContextMenu: React.FC = () => {
    const theme = useTheme()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openContextMenu = (e: React.MouseEvent<SVGSVGElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeContextMenu = () => setAnchorEL(null)

    return (
        <>
            <MoreHorizIcon
                fontSize="small"
                sx={{ cursor: "pointer" }}
                onClick={openContextMenu}
            />
            <Menu
                elevation={0}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                open={anchorEL != null}
                anchorEl={anchorEL}
                onClose={closeContextMenu}
                PaperProps={{
                    sx: {
                        boxShadow: theme.shadows[1],
                    },
                }}
            >
                <MenuItem sx={{ color: theme.palette.warning.main }}>
                    <ListItemText>Löschen</ListItemText>
                </MenuItem>
            </Menu>
        </>
    )
}

const ColumnAttributesWindowButton: React.FC<{ column: Column }> = ({
    column,
}) => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeContextMenu = () => setAnchorEL(null)

    return (
        <>
            <IconButton onClick={openContextMenu}>
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

const getExposedInput = (type: Column.Serialized["_cellContentType"]) => {
    const cellUtil = cells.getCell(type)
    return cellUtil.ExposedInput
}

export const RowMask: React.FC = () => {
    const { data } = useView()
    const { rowMaskState, setRowMaskState } = useRowMask()

    const abort = () => setRowMaskState({ mode: "closed" })

    const createRow = () => {}

    if (data == null) return null

    return (
        <Dialog open={rowMaskState.mode !== "closed"} fullWidth onClose={abort}>
            <DialogTitle>
                <Stack
                    direction="row"
                    sx={{
                        alignItems: "center",
                    }}
                >
                    {rowMaskState.mode === "edit" && <RowNavigator />}
                    <Typography sx={{ ml: 2 }}>
                        {rowMaskState.mode === "create"
                            ? "Neue Zeile erstellen"
                            : rowMaskState.mode === "edit"
                            ? `Zeile ${rowMaskState.row.__rowIndex__}`
                            : ""}
                    </Typography>

                    <Box flexGrow={1} />

                    <RowMaskContextMenu />
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ mx: 2 }}
                        variant="middle"
                    />
                    <CloseIcon
                        onClick={abort}
                        fontSize="small"
                        sx={{ cursor: "pointer" }}
                    />
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent
                sx={{
                    overflowY: "scroll",
                    maxHeight: "70vh",
                    width: 1,
                }}
            >
                {data.columns
                    .filter(
                        column => ColumnUtility.isAppColumn(column) === false
                    )
                    .sort((a, b) =>
                        a.userPrimary! === b.userPrimary!
                            ? 0
                            : a.userPrimary! === true
                            ? -1
                            : 1
                    )
                    .map(column => {
                        const util = cells.getCell(column._cellContentType!)
                        const Icon = util.icon

                        return (
                            <>
                                <Stack
                                    direction={
                                        column.userPrimary === true
                                            ? "column"
                                            : "row"
                                    }
                                    key={column._id!}
                                    sx={{
                                        mb: 6,
                                    }}
                                >
                                    {column.userPrimary === true && (
                                        <KeyIcon fontSize="small" />
                                    )}
                                    <Typography
                                        sx={{
                                            width: "150px",
                                            textAlign: "right",
                                            mr: 6,
                                            mb: 1.5,
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                        variant="caption"
                                    >
                                        <Icon
                                            fontSize="small"
                                            sx={{
                                                mr: 1,
                                            }}
                                        />
                                        {column.name}
                                    </Typography>
                                    {(() => {
                                        if (rowMaskState.mode === "closed")
                                            return null

                                        const Input = getExposedInput(
                                            column._cellContentType!
                                        )

                                        const onChangeHandler = (
                                            value: unknown
                                        ) => {
                                            console.log("new value:", value)
                                        }

                                        return (
                                            <Input
                                                content={
                                                    rowMaskState.mode ===
                                                    "create"
                                                        ? null
                                                        : rowMaskState.row[
                                                              column.key
                                                          ]
                                                }
                                                update={
                                                    rowMaskState.mode ===
                                                    "create"
                                                        ? {
                                                              mode: "alien",
                                                              onChange:
                                                                  onChangeHandler,
                                                          }
                                                        : {
                                                              mode: "self",
                                                              row: rowMaskState.row,
                                                              column: rowMaskState.column,
                                                          }
                                                }
                                            />
                                        )
                                    })()}
                                    <ColumnAttributesWindowButton
                                        column={column}
                                    />
                                </Stack>
                                {column.userPrimary === true && (
                                    <Divider
                                        variant="middle"
                                        flexItem
                                        sx={{ my: 5 }}
                                    />
                                )}
                            </>
                        )
                    })}

                <AddColumnButton />
            </DialogContent>
            {rowMaskState.mode === "create" && (
                <DialogActions sx={{ flexWrap: "wrap" }}>
                    <Divider />
                    <Button onClick={abort}>Abbrechen</Button>
                    <Button onClick={createRow}>Erstellen</Button>
                </DialogActions>
            )}
        </Dialog>
    )
}

export default RowMask
