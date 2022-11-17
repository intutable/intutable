import CloseIcon from "@mui/icons-material/Close"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Typography,
} from "@mui/material"
import { useRowMask } from "context/RowMaskContext"
import { useView } from "hooks/useView"
import React from "react"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { AddColumnButton } from "./AddColumnButton"
import { RowMaskColumn } from "./RowMaskColumn"
import { RowMaskContextMenu } from "./RowMaskContextMenu"
import { RowNavigator } from "./RowNavigator"

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
                            ? `Zeile ${rowMaskState.row.index} (View ${data.descriptor.name})`
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
                    .filter(column => column.hidden !== true)
                    .sort((a, b) =>
                        a.isUserPrimaryKey! === b.isUserPrimaryKey!
                            ? 0
                            : a.isUserPrimaryKey! === true
                            ? -1
                            : 1
                    )
                    .map(column => (
                        <RowMaskColumn column={column} key={column.id} />
                    ))}
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
