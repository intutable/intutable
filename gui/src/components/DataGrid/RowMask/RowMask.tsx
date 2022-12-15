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
import { InputMaskSelect } from "./InputMaskSelect"
import { AddColumnButton, AddLinkButton } from "./DialogActions"
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
        <Dialog open={rowMaskState.mode !== "closed"} fullWidth onClose={abort} keepMounted>
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

                    <InputMaskSelect />
                    <RowMaskContextMenu />
                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} variant="middle" />
                    <CloseIcon onClick={abort} fontSize="small" sx={{ cursor: "pointer" }} />
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent
                sx={{
                    overflowY: "scroll",
                    maxHeight: "70vh",
                    minHeight: "70vh",
                    height: "70vh",
                    width: 1,
                }}
            >
                {data.columns
                    .filter(column => ColumnUtility.isAppColumn(column) === false)
                    .filter(column => column.hidden !== true)
                    .sort((a, b) =>
                        a.isUserPrimaryKey! === b.isUserPrimaryKey! ? 0 : a.isUserPrimaryKey! === true ? -1 : 1
                    )
                    .map(column => (
                        <RowMaskColumn column={column} key={column.id} />
                    ))}
            </DialogContent>

            <Divider />

            <DialogActions
                sx={{
                    justifyContent: "space-evenly",
                }}
            >
                <AddColumnButton />
                <Divider flexItem variant="middle" orientation="vertical" />
                <AddLinkButton />
            </DialogActions>
        </Dialog>
    )
}

export default RowMask
