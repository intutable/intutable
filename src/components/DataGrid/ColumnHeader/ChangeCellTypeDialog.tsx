import React, { useEffect, useState } from "react"
import {
    Box,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContentText,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    FormControl,
    InputLabel,
    Select,
    Typography,
} from "@mui/material"
import {
    CellType,
    isCellType,
    _RuntimeCellTypeMap,
    CellData,
} from "@datagrid/Cell/celltype-management/celltypes"
import {
    isConvertable,
    IsConvertableResponse,
} from "@app/components/DataGrid/Cell/celltype-management"

type ChangeCellTypeDialogProps = {
    currentType: CellType
    open: boolean
    onClose: (newType?: CellType) => void
}

export const ChangeCellTypeDialog: React.FC<
    ChangeCellTypeDialogProps
> = props => {
    const [cellType, setCellType] = useState<CellType>(props.currentType)
    const [conflict, setConflict] = useState<IsConvertableResponse | null>(null)

    const handleChangeCellType = (newType: CellType) => {
        if (isCellType(newType)) setCellType(newType)
    }

    useEffect(() => {
        const from: CellType = props.currentType
        const to: CellType = cellType
        // check if old type can be converted to new type
        const req = isConvertable(from, to)

        if (typeof req === "function") {
            // const data: CellData<"complex"> = {}
            // req(from, to, data)
            // TODO: implement
            setConflict({
                convertable: true,
                conversion: "dependent",
                message: new Error("not implemented"),
            })
            return
        }

        setConflict(req)
    }, [cellType, props.currentType])

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>Zell-Typen ändern</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Hier kannst du den Typ der Zellen einer Spalte ändern. Der
                    aktuelle Typ ist: <i>{props.currentType}</i>. Wähle im
                    Folgenden einen neuen Typ aus.
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

                {conflict && (
                    <Box>
                        <Divider
                            sx={{
                                my: 5,
                            }}
                        />
                        <Typography>
                            {conflict.convertable === false
                                ? `Der Typ ${props.currentType} kann nicht zu ${cellType} konvertiert werden!`
                                : conflict.conversion === "dependent"
                                ? "Einige Zellen können nicht konvertiert werden. Diese müssen manuell angepasst werden! "
                                : "Konvertierung möglich!"}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <Button
                    onClick={props.onClose.bind(null, cellType)}
                    disabled={
                        props.currentType == cellType ||
                        conflict?.convertable === false ||
                        conflict?.conversion === "dependent" ||
                        conflict?.conversion === "none"
                    }
                >
                    Ändern
                </Button>
            </DialogActions>
        </Dialog>
    )
}