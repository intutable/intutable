import cells from "@datagrid/Cells"
import { PrefixIcon } from "@datagrid/renderers/HeaderRenderer/PrefixIcon"
import AddBoxIcon from "@mui/icons-material/AddBox"
import CloseIcon from "@mui/icons-material/Close"
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
    Stack,
    Typography,
} from "@mui/material"
import { useRowMask } from "context/RowMaskContext"
import { useView } from "hooks/useView"
import React, { useEffect, useMemo } from "react"
import { Column } from "types"
import { ColumnUtility } from "utils/ColumnUtility"
import { RowNavigator } from "./RowNavigator"
import KeyIcon from "@mui/icons-material/Key"
import { waitForDebugger } from "inspector"

const getExposedInput = (type: Column.Serialized["_cellContentType"]) => {
    const cellUtil = cells.getCell(type)
    return cellUtil.ExposedInput
}

export const RowMask: React.FC = () => {
    const { data } = useView()

    const { rowMaskState, setRowMaskState } = useRowMask()

    const abort = () => setRowMaskState({ mode: "closed" })

    const create = () => {}

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

                    <MoreHorizIcon
                        fontSize="small"
                        sx={{ cursor: "pointer" }}
                    />
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

                <Button
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
