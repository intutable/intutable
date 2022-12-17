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
    Grid,
} from "@mui/material"
import { ROW_MASK_FALLBACK_VALUE, useRowMask } from "context/RowMaskContext"
import { useView } from "hooks/useView"
import React, { useEffect, useState } from "react"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { InputMaskSelect } from "./InputMaskSelect"
import { AddColumnButton, AddLinkButton } from "./DialogActions"
import { RowMaskColumn } from "./Column"
import { RowMaskContextMenu } from "./ContextMenu"
import { RowNavigator } from "./RowNavigator"
import { useInputMask } from "hooks/useInputMask"
import { CommentSection } from "./Comments"
import { useTheme } from "@mui/material/styles"

export const RowMask: React.FC = () => {
    const theme = useTheme()
    const { data } = useView()
    const { rowMaskState, setRowMaskState, selectedInputMask } = useRowMask()

    const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
    useEffect(() => {
        if (selectedInputMask === ROW_MASK_FALLBACK_VALUE) setCommentsVisible(false)
    }, [selectedInputMask])

    const abort = () => setRowMaskState({ mode: "closed" })

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
                    <RowMaskContextMenu
                        commentsVisible={commentsVisible}
                        toggleCommentsVisible={() => setCommentsVisible(prev => !prev)}
                    />
                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} variant="middle" />
                    <CloseIcon onClick={abort} fontSize="small" sx={{ cursor: "pointer" }} />
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent>
                <Grid container spacing={0}>
                    <Grid item xs={commentsVisible ? 8 : 12}>
                        <Box
                            sx={{ overflowY: "scroll", maxHeight: "70vh", minHeight: "70vh", height: "70vh", width: 1 }}
                        >
                            {data.columns

                                .filter(column => ColumnUtility.isAppColumn(column) === false)
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
                        </Box>
                    </Grid>
                    {commentsVisible && (
                        <Grid item xs={4}>
                            <Stack
                                sx={{
                                    maxHeight: "70vh",
                                    minHeight: "70vh",
                                    height: "70vh",
                                    width: 1,
                                }}
                                direction="row"
                            >
                                <Divider orientation="vertical" sx={{ mx: 2 }} />
                                <CommentSection />
                            </Stack>
                        </Grid>
                    )}
                </Grid>
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
