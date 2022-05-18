import React, { useEffect, useState } from "react"
import type { Column } from "types"
import {
    CellContentType,
    Runtime_CellContentType,
} from "@datagrid/Editor/types/CellContentType"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
    useTheme,
} from "@mui/material"
import sanitizeName from "utils/sanitizeName"

type AddColumnModalProps = {
    open: boolean
    onClose: () => void
    onHandleCreateColumn: (column: Column.Serialized) => Promise<void>
}

export const AddColumnModal: React.FC<AddColumnModalProps> = props => {
    const theme = useTheme()

    const [moreOptionsActive, setMoreOptionsActive] = useState(false)
    const [options, setOptions] = useState<Column.Serialized>({
        _id: undefined!,
        _kind: "standard",
        key: undefined!,
        name: undefined!,
        editable: true,
        editor: "string",
        formatter: "standard",
    })
    const [valid, setValid] = useState(false)

    useEffect(() => {
        if (options.name.length > 0) setValid(true)
        setOption("key", sanitizeName(options.name))
    }, [options.name])

    // DEV ONLY
    useEffect(() => {
        if (options.editor !== "string") {
            alert("Ausschließlich der Typ 'string' wird zzt. unterstützt!")
            setOption("editor", "string")
        }
    }, [options.editor])

    const setOption = <T extends keyof Column.Serialized>(
        option: T,
        value: Column.Serialized[T]
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
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="addcol-select-type">Typ</InputLabel>
                        <Select
                            labelId="addcol-select-type"
                            label="Typ"
                            value={options.editor}
                            onChange={e =>
                                setOption(
                                    "editor",
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
                    {moreOptionsActive && (
                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={options.editable ?? true}
                                        onChange={e =>
                                            setOption(
                                                "editable",
                                                e.target.checked
                                            )
                                        }
                                    />
                                }
                                label="Editierbar"
                            />
                        </Box>
                    )}
                </FormControl>
                <Typography
                    sx={{
                        fontStyle: "italic",
                        color: theme.palette.text.disabled,
                        fontSize: theme.typography.caption,
                        fontWeight: theme.typography.fontWeightLight,
                        cursor: "pointer",
                        textAlign: "right",
                        mt: 2,
                        "&:hover": {
                            textDecoration: "underline",
                        },
                    }}
                    onClick={() => setMoreOptionsActive(prev => !prev)}
                >
                    {moreOptionsActive ? "Weniger" : "Erweiterte"} Einstellungen
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <Button
                    onClick={async () => {
                        await props.onHandleCreateColumn(options)
                        props.onClose()
                    }}
                    disabled={valid == false}
                >
                    Erstellen
                </Button>
            </DialogActions>
        </Dialog>
    )
}
