import Cells from "@datagrid/Cells"
import HelpIcon from "@mui/icons-material/Help"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useColumn } from "hooks/useColumn"
import { useSnacki } from "hooks/useSnacki"
import React, { useEffect, useState } from "react"
import {
    ColumnFactory,
    CreateColumnFactoryProps,
} from "utils/column utils/ColumnFactory"

type AddColumnModalProps = {
    open: boolean
    onClose: () => void
}

export const AddColumnModal: React.FC<AddColumnModalProps> = props => {
    const theme = useTheme()

    const { snackError } = useSnacki()
    const { createColumn: _createColumn } = useColumn()

    const createColumn = async () => {
        try {
            const column = new ColumnFactory(options)
            await _createColumn(column)
        } catch (error) {
            snackError("Die Spalte konnte nicht erstellt werden!")
        }
    }

    const [options, setOptions] = useState<CreateColumnFactoryProps>({
        name: "",
        cellType: "string",
    })
    const [valid, setValid] = useState(false)

    useEffect(() => {
        if (options.name.length > 0) setValid(true)
    }, [options.name])

    const setOption = <T extends keyof CreateColumnFactoryProps>(
        option: T,
        value: CreateColumnFactoryProps[T]
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
                <FormControl fullWidth sx={{ mt: 2 }}>
                    {/* Name */}
                    <TextField
                        label="Name"
                        variant="outlined"
                        value={options.name}
                        onChange={e => setOption("name", e.target.value)}
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
                                value={options.cellType}
                                onChange={e => {
                                    setOption("cellType", e.target.value)
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
                        <Tooltip
                            title="Typ der Zellen einer Spalte"
                            arrow
                            enterDelay={1000}
                            placement="right"
                        >
                            <IconButton
                                size="small"
                                sx={{
                                    mt: 2,
                                    ml: 0.5,
                                }}
                            >
                                <HelpIcon
                                    sx={{
                                        cursor: "pointer",
                                        fontSize: "85%",
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <Button onClick={createColumn} disabled={valid == false}>
                    Erstellen
                </Button>
            </DialogActions>
        </Dialog>
    )
}
