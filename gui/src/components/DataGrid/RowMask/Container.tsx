import { AddPendingRow } from "@datagrid/Toolbar/ToolbarItems/AddRow/AddPendingRow"
import {
    Alert,
    AlertTitle,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    Grid,
    Stack,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import { useInputMask } from "hooks/useInputMask"
import { useView } from "hooks/useView"
import React, { useState } from "react"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { RowMaskColumn } from "./Column"
import { CommentSection } from "./Comments"
import { AddColumnButton, AddLinkButton } from "./DialogActions"
import { MakeInputMaskColumns } from "./InputMask"

import Link from "components/Link"
import { ConstraintValidationProvider } from "context/ConstraintValidationContext"
import { useSnacki } from "hooks/useSnacki"
import { useUserSettings } from "hooks/useUserSettings"
import { ConstraintSection } from "./Constraints/ConstraintSection"
import { ConstraintValidationButton } from "./Constraints/ConstraintValidationButton"
import { Header } from "./RowMaskContainerHead"

export const RowMaskContainer: React.FC = () => {
    const theme = useTheme()
    const { snackWarning, snackError } = useSnacki()
    const { data } = useView()
    const { rowMaskState, setRowMaskState, appliedInputMask: selectedInputMask } = useRowMask()
    const { currentInputMask } = useInputMask()
    const isInputMask = selectedInputMask != null
    const { userSettings } = useUserSettings()
    // const { isValid } = useConstraintValidation()

    const [commentSectionOpen, setCommentSectionOpen] = useState<boolean>(false)

    // const { ...state } = useCheckRequiredInputs()
    // console.log(state)

    const [constraintSectionOpen, setConstraintSectionOpen] = useState<boolean>(true)

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
        <ConstraintValidationProvider>
            <Dialog
                open
                fullWidth
                onClose={abort}
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

                {userSettings?.constraintValidation === "never" && isInputMask && (
                    <Box sx={{ px: 5, my: 3 }}>
                        <Alert severity="error" variant="filled">
                            <AlertTitle>
                                Achtung! Ihre Constraint-Validierung ist ausgeschaltet.
                            </AlertTitle>
                            Schalten Sie diese nur aus, wenn Sie sich sicher sind. Unerwartete
                            Fehler können auftreten! Unter{" "}
                            <Link href="/settings">Einstellungen &#8250; Eingabemasken</Link> können
                            Sie die Constraint-Validierung wieder einschalten.
                        </Alert>
                    </Box>
                )}

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
                                        maxHeight: "70vh",
                                        minHeight: "70vh",
                                        height: "70vh",
                                        width: 1,
                                    }}
                                    direction="row"
                                >
                                    <Divider orientation="vertical" sx={{ mx: 2 }} />
                                    <Box
                                        sx={{
                                            overflowY: "scroll",
                                        }}
                                    >
                                        <ConstraintSection
                                            onClose={() => setConstraintSectionOpen(false)}
                                        />
                                    </Box>
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

                    <Box
                        sx={{
                            position: "absolute",
                            right: 10,
                        }}
                    >
                        <ConstraintValidationButton />
                    </Box>
                </DialogActions>
            </Dialog>
        </ConstraintValidationProvider>
    )
}

export default RowMaskContainer
