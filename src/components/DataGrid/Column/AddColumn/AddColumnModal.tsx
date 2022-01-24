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
    TextField,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Checkbox,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
    CellType,
    _RuntimeCellTypeMap,
} from "@datagrid/Cell/celltype-management/celltypes"
import { ServerColumn, TableData } from "@app/api/types"

// type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
//     infer ElementType
// >
//     ? ElementType
//     : never
// type Col = ElementType<TableData["columns"]>

type AddColumnModalProps = {
    open: boolean
    onClose: (col?: ServerColumn) => void
}

export const AddColumnModal: React.FC<AddColumnModalProps> = props => {
    const [options, setOptions] = useState<ServerColumn>({
        name: "",
        key: "",
        editable: true,
        editor: "string",
    })
    const [valid, setValid] = useState(false)

    useEffect(() => {
        // setOptions(prev => ({
        //     ...prev,
        //     key: prev.name,
        // }))
    }, [options.name])

    const setOption = <T extends keyof ServerColumn>(
        option: T,
        value: ServerColumn[T]
    ) => {
        setOptions(prev => ({
            ...prev,
            [option]: value,
        }))
    }

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>Neue Spalte erstellen</DialogTitle>
            <DialogContent>
                <FormControl
                    fullWidth
                    sx={{
                        my: 3,
                    }}
                >
                    {/* Name */}
                    <TextField
                        label="Name"
                        variant="outlined"
                        value={options.name}
                        onChange={e => setOption("name", e.target.value)}
                    />

                    {/* Type */}
                    <InputLabel id="select-label">Typ</InputLabel>
                    <Select
                        labelId="select-label"
                        label="Neuer Typ"
                        value={options.editable}
                        onChange={e =>
                            setOption("editor", e.target.value as CellType)
                        }
                    >
                        {_RuntimeCellTypeMap.map((type, i) => (
                            <MenuItem key={i} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        Weitere Eigenschaften
                    </AccordionSummary>
                    <AccordionDetails>
                        Editierbar
                        <Checkbox value={options.editable} />
                    </AccordionDetails>
                </Accordion>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <Button
                    onClick={props.onClose.bind(null, options!)}
                    disabled={valid == false}
                >
                    Ändern
                </Button>
            </DialogActions>
        </Dialog>
    )
}
