import cells from "@datagrid/Cells"
import { ColumnAttributesWindow } from "@datagrid/renderers/HeaderRenderer/ColumnAttributesWindow"
import { AddColumnModal } from "@datagrid/Toolbar/ToolbarItems/AddCol/AddColumnModal"
import AddBoxIcon from "@mui/icons-material/AddBox"
import CloseIcon from "@mui/icons-material/Close"
import EditIcon from "@mui/icons-material/Edit"
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
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import React, { useState } from "react"
import { Column } from "types"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { RowNavigator } from "./RowNavigator"

const AddColumnButton: React.FC = () => {
    const { snackError } = useSnacki()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAnchorEL(event.currentTarget)
    }
    const handleCloseModal = () => setAnchorEL(null)

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

const getExposedInput = (type: Column.Serialized["cellType"]) => {
    const cellUtil = cells.getCell(type)
    return cellUtil.ExposedInput
}

export const RowMask: React.FC = () => {
    const { data } = useView()
    const { rowMaskState, setRowMaskState } = useRowMask()

    const abort = () => setRowMaskState({ mode: "closed" })

    const createRow = () => {}

    if (data == null) return null

    console.dir(rowMaskState.row)

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
                            ? `Zeile ${rowMaskState.row.index}`
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
                        a.isUserPrimaryKey! === b.isUserPrimaryKey!
                            ? 0
                            : a.isUserPrimaryKey! === true
                            ? -1
                            : 1
                    )
                    .map(column => {
                        const util = cells.getCell(column.cellType!)
                        const Icon = util.icon

                        return (
                            <>
                                <Stack
                                    direction={
                                        column.isUserPrimaryKey === true
                                            ? "column"
                                            : "row"
                                    }
                                    key={column.id}
                                    sx={{
                                        mb: 6,
                                    }}
                                >
                                    {column.isUserPrimaryKey === true && (
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
                                            column.cellType
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
                                        column={column as Column.Serialized}
                                    />
                                </Stack>
                                {column.isUserPrimaryKey === true && (
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
