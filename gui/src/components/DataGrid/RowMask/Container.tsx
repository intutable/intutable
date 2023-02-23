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
    Tooltip,
    IconButton,
} from "@mui/material"
import { useRowMask } from "context/RowMaskContext"
import { useView } from "hooks/useView"
import React, { useDebugValue, useEffect, useState } from "react"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { DevOverlay } from "./DevOverlay"
import { AddColumnButton, AddLinkButton } from "./DialogActions"
import { RowMaskColumn } from "./Column"
import { RowMaskContextMenu } from "./ContextMenu"
import { RowNavigator } from "./RowNavigator"
import { useInputMask } from "hooks/useInputMask"
import { CommentSection } from "./Comments"
import { useTheme } from "@mui/material/styles"
import { AddPendingRow } from "@datagrid/Toolbar/ToolbarItems/AddRow/AddPendingRow"
import { Column } from "types/tables/rdg"
import { ColumnGroup } from "@shared/input-masks/types"
import { MakeInputMaskColumns } from "./InputMask"

import VerifiedIcon from "@mui/icons-material/Verified"
import RuleIcon from "@mui/icons-material/Rule"
import { ConstraintValidationButton } from "./Constraints/ConstraintValidationButton"
import { ConstraintSection } from "./Constraints/ConstraintSection"
import { useConstraintValidation } from "context/ConstraintContext"
import { useCheckRequiredInputs } from "hooks/useCheckRequiredInputs"
import DeleteIcon from "@mui/icons-material/Delete"
import { useRecordDraftSession } from "hooks/useRecordDraftSession"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { Bookmark } from "@mui/icons-material"
import { BookmarkButton } from "./Bookmark"
import { Header } from "./RowMaskContainerHead"

export const RowMaskContainer: React.FC = () => {
    const theme = useTheme()
    const { snackWarning, snackError } = useSnacki()
    const { data } = useView()
    const { rowMaskState, setRowMaskState, appliedInputMask: selectedInputMask } = useRowMask()
    const { currentInputMask } = useInputMask()
    const isInputMask = selectedInputMask != null
    // const { isValid } = useConstraintValidation()

    const [commentSectionOpen, setCommentSectionOpen] = useState<boolean>(false)

    // const { ...state } = useCheckRequiredInputs()
    // console.log(state)

    const [constraintSectionOpen, setConstraintSectionOpen] = useState<boolean>(false)

    const abort = () => {
        // if (isValid === false)
        //     alert("Die Eingaben sind nicht gültig. Bitte korrigieren Sie die Fehler.")
        setRowMaskState({ mode: "closed" })
    }

    if (rowMaskState.mode === "closed" || data == null) return null
    const nonHidden = data.columns.filter(column => column.hidden !== true)
    const columns = nonHidden
    const selectedRow = data.rows.find(row => row._id === rowMaskState.row._id)
    if (selectedRow == null) return null

    return (
        <Dialog
            open
            fullWidth
            onClose={abort}
            keepMounted
            maxWidth={constraintSectionOpen && isInputMask ? "md" : "sm"}
        >
            <Header
                selectedRow={selectedRow}
                commentSectionOpen={commentSectionOpen}
                setCommentSectionOpen={setCommentSectionOpen}
                constrainSectionOpen={constraintSectionOpen}
                setConstrainSectionOpen={setConstraintSectionOpen}
            />

            <Divider />

            <DialogContent>
                <Stack direction="row">
                    <Grid container spacing={0}>
                        {/* columns */}
                        <Grid item xs={commentSectionOpen ? 8 : 12}>
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

                        {/* comment section */}
                        {commentSectionOpen && isInputMask && (
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
                    {/* constraints section */}
                    {constraintSectionOpen && isInputMask && (
                        <Box>
                            <Stack
                                sx={{
                                    height: "100%",
                                }}
                                direction="row"
                            >
                                <Divider orientation="vertical" sx={{ mx: 2 }} />
                                <ConstraintSection
                                    onClose={() => setConstraintSectionOpen(false)}
                                />
                            </Stack>
                        </Box>
                    )}
                </Stack>
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
                        <ConstraintValidationButton
                            onShowInvalidConstraints={() => setConstraintSectionOpen(true)}
                        />
                    </Box>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default RowMaskContainer
