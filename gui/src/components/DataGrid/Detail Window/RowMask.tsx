import cells from "@datagrid/Cells"
import { ExposedInputUpdateCallback } from "@datagrid/Cells/abstract/Cell"
import AddBoxIcon from "@mui/icons-material/AddBox"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import CloseIcon from "@mui/icons-material/Close"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Typography,
} from "@mui/material"
import { useRowMask } from "context/RowMaskContext"
import { useView } from "hooks/useView"
import React from "react"
import { Column } from "types"
import { ColumnUtility } from "utils/ColumnUtility"

const RowNavigator: React.FC = () => {
    const { data } = useView()
    const { rowMaskState, setRowMaskState } = useRowMask()

    const navigateRow = (action: "next" | "previous") => {
        if (rowMaskState.mode !== "edit" || data == null) return
        const maxIndex = data.rows.length
        const nextIndex =
            action === "next"
                ? rowMaskState.row.__rowIndex__ + 1 > maxIndex
                    ? 0
                    : rowMaskState.row.__rowIndex__ + 1
                : rowMaskState.row.__rowIndex__ - 1 < 0
                ? maxIndex
                : rowMaskState.row.__rowIndex__ - 1
        setRowMaskState(prev => ({
            mode: "edit",
            row: data.rows.find(row => row.__rowIndex__ === nextIndex)!,
            column: Object.prototype.hasOwnProperty.call(prev, "column")
                ? (prev as { column: Column }).column
                : data.columns.filter(
                      column => ColumnUtility.isAppColumn(column) === false
                  )[0],
        }))
    }

    return (
        <Stack
            sx={{
                mr: 1,
            }}
        >
            <ArrowDropUpIcon
                fontSize="small"
                sx={{
                    cursor: "pointer",
                }}
                onClick={() => navigateRow("previous")}
            />
            <ArrowDropDownIcon
                fontSize="small"
                sx={{
                    cursor: "pointer",
                }}
                onClick={() => navigateRow("next")}
            />
        </Stack>
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
    const create = () => {}
    const save = () => {}

    if (data == null) return null

    return (
        <Dialog
            open={rowMaskState.mode !== "closed"}
            fullWidth
            maxWidth="xs"
            onClose={() => setRowMaskState({ mode: "closed" })}
        >
            <DialogTitle>
                <Stack direction="row">
                    {rowMaskState.mode === "edit" && <RowNavigator />}
                    {rowMaskState.mode === "create"
                        ? "Neue Zeile erstellen"
                        : rowMaskState.mode === "edit"
                        ? `Zeile ${rowMaskState.row.__rowIndex__}`
                        : ""}
                    <IconButton>
                        <MoreHorizIcon fontSize="small" />
                    </IconButton>
                    <Divider orientation="vertical" />
                    <IconButton
                        onClick={() => setRowMaskState({ mode: "closed" })}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent
                sx={{
                    overflowY: "scroll",
                    maxHeight: "70%",
                }}
            >
                {data.columns
                    .filter(
                        column => ColumnUtility.isAppColumn(column) === false
                    )
                    .map(column => (
                        <Stack direction="row" key={column._id!}>
                            <Typography>
                                {cells.getCell(column._cellContentType!).icon}
                                {column.name}
                            </Typography>
                            {(() => {
                                if (rowMaskState.mode === "closed") return null

                                const Input = getExposedInput(
                                    column._cellContentType!
                                )

                                const updateCallback: ExposedInputUpdateCallback =
                                    {
                                        onChange: value => {},
                                    }

                                const content =
                                    rowMaskState.mode === "create"
                                        ? null
                                        : rowMaskState.row[column.key]

                                return (
                                    <Input
                                        content={content}
                                        updateHandler={
                                            rowMaskState.mode === "create"
                                                ? updateCallback
                                                : { ...rowMaskState }
                                        }
                                    />
                                )
                            })()}
                        </Stack>
                    ))}

                <Typography>
                    <AddBoxIcon fontSize="small" />
                    Neue Spalte erstellen
                </Typography>
            </DialogContent>
            {rowMaskState.mode === "create" && (
                <DialogActions sx={{ flexWrap: "wrap" }}>
                    <Divider />
                    <Button onClick={abort}>Abbrechen</Button>
                    <Button onClick={create}>Erstellen</Button>
                </DialogActions>
            )}
        </Dialog>
    )
}

export default RowMask
