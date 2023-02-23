import CloseIcon from "@mui/icons-material/Close"
import { Box, DialogTitle, Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useRowMask } from "context/RowMaskContext"
import { useInputMask } from "hooks/useInputMask"
import { useView } from "hooks/useView"
import React from "react"
import { RowMaskContextMenu } from "./ContextMenu"
import { DevOverlay } from "./DevOverlay"
import { RowNavigator } from "./RowNavigator"

import DeleteIcon from "@mui/icons-material/Delete"
import { useConstraintValidation } from "context/ConstraintValidationContext"
import { useRecordDraftSession } from "hooks/useRecordDraftSession"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { Row } from "types"
import { BookmarkButton } from "./Bookmark"

export type HeaderProps = {
    selectedRow: Row
    commentSectionOpen: boolean
    setCommentSectionOpen: React.Dispatch<React.SetStateAction<boolean>>
    constrainSectionOpen: boolean
    setConstrainSectionOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const Header: React.FC<HeaderProps> = props => {
    const { selectedRow, commentSectionOpen, setCommentSectionOpen } = props

    const theme = useTheme()
    const { snackWarning, snackError } = useSnacki()
    const { data } = useView()
    const { rowMaskState, setRowMaskState, appliedInputMask: selectedInputMask } = useRowMask()
    const { currentInputMask } = useInputMask()
    const isInputMask = selectedInputMask != null
    // const { isValid } = useConstraintValidation()
    const { deleteRow } = useRow()
    const { isDraft } = useRecordDraftSession()

    const deleteDraft = async () => {
        try {
            if (selectedRow == null) throw new Error("No row selected")
            await deleteRow(selectedRow)
            snackWarning("Entwurf gelöscht.")
        } catch (error) {
            snackError("Der Entwurf konnte nicht gelöscht werden.")
        }
    }

    const abort = () => {
        // if (isValid === false)
        //     alert("Die Eingaben sind nicht gültig. Bitte korrigieren Sie die Fehler.")
        setRowMaskState({ mode: "closed" })
    }

    if (rowMaskState.mode === "closed" || data == null) return null

    return (
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
                    commentSectionOpen={commentSectionOpen}
                    toggleCommentSection={() => setCommentSectionOpen(prev => !prev)}
                    constraintSectionOpen={props.constrainSectionOpen}
                    toggleConstrainSection={() => props.setConstrainSectionOpen(prev => !prev)}
                />
                <BookmarkButton row={selectedRow} />

                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} variant="middle" />

                {isInputMask && currentInputMask?.draftsCanBeDeleted && isDraft(selectedRow) && (
                    <Tooltip arrow placement="bottom" title="Entwurf löschen" enterDelay={1000}>
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
                <Tooltip arrow placement="bottom" title="Speichern & Schließen" enterDelay={1000}>
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
    )
}
