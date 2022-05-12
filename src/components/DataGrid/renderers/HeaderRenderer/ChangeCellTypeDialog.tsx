import {
    isConvertable,
    IsConvertableResponse,
} from "@datagrid/Editor_Formatter/type-management"
import {
    CellContentType,
    isCellContentType,
    Runtime_CellContentType,
} from "@datagrid/Editor_Formatter/types/CellContentType"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from "@mui/material"
import React, { useEffect, useState } from "react"

type ChangeCellTypeDialogProps = {
    currentType: CellContentType
    open: boolean
    onClose: (newType?: CellContentType) => void
}

export const ChangeCellTypeDialog: React.FC<
    ChangeCellTypeDialogProps
> = props => {
    const [cellType, setCellType] = useState<CellContentType>(props.currentType)
    const [conflict, setConflict] = useState<IsConvertableResponse | null>(null)

    const handleChangeCellType = (newType: CellContentType) => {
        if (isCellContentType(newType)) setCellType(newType)
    }

    useEffect(() => {
        const from: CellContentType = props.currentType
        const to: CellContentType = cellType
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
                            handleChangeCellType(
                                e.target.value as CellContentType
                            )
                        }
                    >
                        {Runtime_CellContentType.map((type, i) => (
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
