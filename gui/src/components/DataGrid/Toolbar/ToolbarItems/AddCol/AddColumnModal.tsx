import Cells from "@datagrid/Cells"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material"
import { TooltipIcon } from "components/TooltipIcon"
import React from "react"
import { useColumnFactory } from "utils/column utils/ColumnFactory"

type AddColumnModalProps = {
    open: boolean
    onClose: () => void
}

export const AddColumnModal: React.FC<AddColumnModalProps> = props => {
    const { request, setProperty, valid, initialColumnProps } =
        useColumnFactory()

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>Neue Spalte erstellen</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    {/* Name */}
                    <TextField
                        label="Name"
                        variant="outlined"
                        value={initialColumnProps.name}
                        onChange={e => setProperty("name", e.target.value)}
                    />

                    {/* Type */}
                    <Stack
                        direction="row"
                        sx={{
                            alignItems: "center",
                        }}
                    >
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel id="addcol-select-type">Typ</InputLabel>
                            <Select
                                labelId="addcol-select-type"
                                label="Typ"
                                value={initialColumnProps.cellType}
                                onChange={e => {
                                    setProperty("cellType", e.target.value)
                                }}
                            >
                                {Cells.map(cell => (
                                    <MenuItem
                                        key={cell.brand}
                                        value={cell.brand}
                                    >
                                        {cell.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TooltipIcon tooltip="Typ der Zellen einer Spalte" />
                    </Stack>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <Button
                    onClick={async () => await request()}
                    disabled={valid === false}
                >
                    Erstellen
                </Button>
            </DialogActions>
        </Dialog>
    )
}
