import React, { useState } from "react"
import {
    Box,
    useTheme,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContentText,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
} from "@mui/material"
import { CellType, isCellType, _RuntimeCellTypeMap } from "@datagrid/Cell/types"

type ChangeCellTypeDialogProps = {
    currentType: CellType
    open: boolean
    onClose: (newType?: CellType) => void
}

export const ChangeCellTypeDialog: React.FC<ChangeCellTypeDialogProps> =
    props => {
        const [cellType, setCellType] = useState<CellType>(props.currentType)
        const [conflict, setConflict] = useState(false)

        const handleChangeCellType = (newType: CellType) => {
            if (isCellType(newType)) setCellType(newType)
        }

        return (
            <Dialog open={props.open} onClose={() => props.onClose()}>
                <DialogTitle>Zell-Typen ändern</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Hier kannst du den Typ der Zellen einer Spalte ändern.
                        Der aktuelle Typ ist: <i>{props.currentType}</i>. Wähle
                        im Folgenden einen neuen Typ aus.
                    </DialogContentText>
                    <FormControl
                        fullWidth
                        sx={{
                            mt: 3,
                        }}
                    >
                        <InputLabel id="select-label">Neuer Typ</InputLabel>
                        <Select
                            labelId="select-label"
                            label="Neuer Typ"
                            value={cellType}
                            onChange={e =>
                                handleChangeCellType(e.target.value as CellType)
                            }
                        >
                            {_RuntimeCellTypeMap.map((type, i) => (
                                <MenuItem key={i} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {conflict && <></>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => props.onClose()}>Abbrechen</Button>
                    <Button
                        onClick={props.onClose.bind(null, cellType)}
                        disabled={props.currentType == cellType}
                    >
                        Ändern
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
