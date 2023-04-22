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
import { useRowMask } from "context/RowMaskContext"
import { useView } from "hooks/useView"
import React, { useState } from "react"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { RowMaskColumn } from "./Column"
import { CommentSection } from "./Comments"
import { AddColumnButton, AddLinkButton } from "./DialogActions"
import { MakeInputMaskColumns } from "./InputMask"

import Link from "components/Link"
import { ConstraintValidationProvider } from "context/ConstraintValidationContext"
import { useUserSettings } from "hooks/useUserSettings"
import { ConstraintSection } from "./Constraints/ConstraintSection"
import { ConstraintValidationButton } from "./Constraints/ConstraintValidationButton"
import { Header } from "./RowMaskContainerHead"
import { TurnedOffConstraintValidationAlert } from "./TurnedOffConstraintValidationAlert"

export const RowMaskContainer: React.FC = () => {
    const { data } = useView()
    const { row, close, inputMask } = useRowMask()
    const isInputMask = inputMask != null
    const { userSettings } = useUserSettings()
    // const { isValid } = useConstraintValidation()

    const [commentSectionOpen, setCommentSectionOpen] = useState<boolean>(false)

    // const { ...state } = useCheckRequiredInputs()
    // console.log(state)

    const [constraintSectionOpen, setConstraintSectionOpen] = useState<boolean>(false)

    const abort = () => close()

    if (!row || data == null) return null
    const nonHidden = data.columns.filter(column => column.hidden !== true)
    const columns = nonHidden
    const selectedRow = row

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

                <TurnedOffConstraintValidationAlert />

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
                    <AddPendingRow text={isInputMask ? inputMask.addRecordButtonText : undefined} />
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
                        <ConstraintValidationButton
                            onClick={() => setConstraintSectionOpen(prev => !prev)}
                        />
                    </Box>
                </DialogActions>
            </Dialog>
        </ConstraintValidationProvider>
    )
}

export default RowMaskContainer
