import { AddPendingRow } from "@datagrid/Toolbar/ToolbarItems/AddRow/AddPendingRow"
import CloseIcon from "@mui/icons-material/Close"
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import { useInputMask } from "hooks/useInputMask"
import { useView } from "hooks/useView"
import React, { useEffect, useState } from "react"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { RowMaskColumn } from "./Column"
import { CommentSection } from "./Comments"
import { RowMaskContextMenu } from "./ContextMenu"
import { DevOverlay } from "./DevOverlay"
import { AddColumnButton, AddLinkButton } from "./DialogActions"
import { MakeInputMaskColumns } from "./InputMask"
import { RowNavigator } from "./RowNavigator"
import DeleteIcon from "@mui/icons-material/Delete"
import { useConstraints } from "context/ConstraintsContext"
import { useRecordDraftSession } from "hooks/useRecordDraftSession"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { ConstraintMismatches } from "./ConstraintMismatches"
import { ConstraintsValid } from "./ConstraintsValid"
import { BookmarkButton } from "./Bookmark"

export const RowMaskContainer: React.FC = () => {
    const theme = useTheme()
    const { snackWarning, snackError } = useSnacki()
    const { data } = useView()
    const { rowMaskState, setRowMaskState, appliedInputMask: selectedInputMask } = useRowMask()
    const { currentInputMask } = useInputMask()
    const isInputMask = selectedInputMask != null
    const { isValid } = useConstraints()
    const { deleteRow } = useRow()

    const { isDraft } = useRecordDraftSession()

    const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
    useEffect(() => {
        // no comment section for default mask
        if (isInputMask === false) setCommentsVisible(false)
    }, [isInputMask])

    const deleteDraft = async () => {
        try {
            if (selectedRow == null) throw new Error("No row selected")
            await deleteRow(selectedRow)
            snackWarning("Entwurf gelöscht.")
        } catch (error) {
            snackError("Der Entwurf konnte nicht gelöscht werden.")
        }
    }

    // const { ...state } = useCheckRequiredInputs()
    // console.log(state)

    const [mismatchingConstraintsVisible, setMismatchingConstraintsVisible] =
        useState<boolean>(false)

    const abort = () => {
        if (isValid === false)
            alert("Die Eingaben sind nicht gültig. Bitte korrigieren Sie die Fehler.")
        setRowMaskState({ mode: "closed" })
    }

    if (rowMaskState.mode === "closed" || data == null) return null

    const nonHidden = data.columns.filter(column => column.hidden !== true)
    const columns = nonHidden

    const selectedRow = data.rows.find(row => row._id === rowMaskState.row._id)
    if (selectedRow == null) return null

    return (
        <Dialog open fullWidth onClose={abort}>
            <DialogTitle>
                <Stack
                    direction="row"
                    sx={{
                        alignItems: "center",
                    }}
                >
                    {rowMaskState.mode === "edit" && <RowNavigator />}
                    <Typography sx={{ ml: 2 }}>Zeile {selectedRow.index}</Typography>
                    <Box flexGrow={1} />
                    <DevOverlay />
                    <RowMaskContextMenu
                        commentsVisible={commentsVisible}
                        toggleCommentsVisible={() => setCommentsVisible(prev => !prev)}
                    />
                    <BookmarkButton row={selectedRow} />
                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} variant="middle" />
                    {isInputMask &&
                        currentInputMask?.draftsCanBeDeleted &&
                        isDraft(selectedRow) && (
                            <Tooltip
                                arrow
                                placement="bottom"
                                title="Entwurf löschen"
                                enterDelay={1000}
                            >
                                <IconButton
                                    size="small"
                                    sx={{
                                        "&:hover": {
                                            color: theme.palette.error.light,
                                        },
                                    }}
                                    onClick={deleteDraft}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    <Tooltip
                        arrow
                        placement="bottom"
                        title="Speichern & Schließen"
                        enterDelay={1000}
                    >
                        <IconButton
                            size="small"
                            onClick={abort}
                            sx={{
                                "&:hover": {
                                    color: theme.palette.success.main,
                                },
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Grid container spacing={0}>
                    {/* columns */}
                    <Grid item xs={commentsVisible ? 8 : 12}>
                        <Box
                            sx={{
                                overflowY: "scroll",
                                maxHeight: "70vh",
                                minHeight: "70vh",
                                height: "70vh",
                                width: 1,
                            }}
                        >
                            {isInputMask ? (
                                <MakeInputMaskColumns columns={columns} />
                            ) : (
                                columns
                                    .sort(ColumnUtility.sortByIndex)
                                    .map(column => (
                                        <RowMaskColumn column={column} key={column.id} />
                                    ))
                            )}
                        </Box>
                    </Grid>

                    {/* constraints section */}
                    {mismatchingConstraintsVisible && (
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
                                <ConstraintMismatches
                                    onClose={() => setMismatchingConstraintsVisible(false)}
                                />
                            </Stack>
                        </Grid>
                    )}

                    {/* comment section */}
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
                <AddPendingRow
                    text={isInputMask ? currentInputMask?.addRecordButtonText : undefined}
                />
                {isInputMask === false && (
                    <>
                        <Divider flexItem variant="middle" orientation="vertical" />
                        <AddColumnButton />
                        <Divider flexItem variant="middle" orientation="vertical" />
                        <AddLinkButton />
                    </>
                )}
                {isInputMask && (
                    <Box
                        sx={{
                            position: "absolute",
                            right: 10,
                        }}
                    >
                        <ConstraintsValid
                            onShowInvalidConstraints={() => setMismatchingConstraintsVisible(true)}
                        />
                    </Box>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default RowMaskContainer
