import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Switch,
} from "@mui/material"
import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import React from "react"
import { Column } from "types"
import { ProxyColumn } from "utils/column utils/ColumnProxy"

export const HiddenColumnSwitch: React.FC<{
    column: Column.Deserialized
    action: (column: Column.Deserialized) => Promise<void>
}> = ({ column, action }) => (
    <FormControlLabel
        label={column.name}
        labelPlacement="end"
        control={
            <Switch checked={column.hidden} onChange={() => action(column)} />
        }
        sx={{
            display: "block",
        }}
    />
)

type HiddenColumnsDialogProps = {
    open: boolean
    onClose: () => void
}

export const HiddenColumnsDialog: React.FC<
    HiddenColumnsDialogProps
> = props => {
    const { snackError } = useSnacki()
    const { data } = useView()
    const { changeAttributes } = useColumn()

    const changeVisibility = async (column: Column.Deserialized) => {
        try {
            await changeAttributes(column, {
                hidden: !column.hidden,
            })
        } catch (error) {
            snackError(
                "Die Sichtbarkeit der Spalte konnte nicht geändert werden!"
            )
        }
    }
    if (data) console.log(data.columns.map(c => (c as ProxyColumn).formatter))

    if (data == null) return null

    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>Verstecke Spalten</DialogTitle>
            <DialogContent>
                {data.columns.map(column => (
                    <HiddenColumnSwitch
                        key={column.id}
                        column={column}
                        action={changeVisibility}
                    />
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Schließen</Button>
            </DialogActions>
        </Dialog>
    )
}
