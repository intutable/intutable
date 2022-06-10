import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
} from "@mui/material"
import React, { useState } from "react"

type GenerateMailListDialogProps = {
    open: boolean
    onClose: () => void
}

type State = {
    format: "csv" | "json"
}

export const GenerateMailListDialog: React.FC<
    GenerateMailListDialogProps
> = props => {
    const [state, setState] = useState<State>({
        format: "csv",
    })
    const updateState = <T extends keyof State>(key: T, value: State[T]) =>
        setState(prev => ({
            ...prev,
            [key]: value,
        }))

    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>Mailing-Liste erstellen</DialogTitle>
            <DialogContent>
                <DialogContentText>Mailing-Liste erstellen</DialogContentText>
                <FormControl
                    fullWidth
                    sx={{
                        mt: 3,
                    }}
                >
                    <Select></Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <Button onClick={props.onClose} disabled>
                    Erstellen
                </Button>
            </DialogActions>
        </Dialog>
    )
}
