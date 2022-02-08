import { SerializedColumn } from "@app/types/types"
import {
    EditorType,
    RuntimeEditorMap,
} from "@app/components/DataGrid/Editor/editor-management/editorTypes"
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
import React, { useEffect, useState } from "react"

// type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
//     infer ElementType
// >
//     ? ElementType
//     : never
// type Col = ElementType<TableData["columns"]>

type AddColumnModalProps = {
    open: boolean
    onClose: (col?: SerializedColumn) => void
}

export const AddColumnModal: React.FC<AddColumnModalProps> = props => {
    const theme = useTheme()

    const [moreOptionsActive, setMoreOptionsActive] = useState(false)
    const [options, setOptions] = useState<SerializedColumn>({
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

    // DEV ONLY
    useEffect(() => {
        if (options.editor !== "string") {
            alert("Ausschließlich der Typ 'string' wird zzt. unterstützt!")
            setOption("editor", "string")
        }
    }, [options.editor])

    const setOption = <T extends keyof SerializedColumn>(
        option: T,
        value: SerializedColumn[T]
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
                                    e.target.value as EditorType
                                )
                            }
                        >
                            {RuntimeEditorMap.map((type, i) => (
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
                                        checked={options.editable}
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
                    onClick={props.onClose.bind(null, options!)}
                    disabled={valid == false}
                >
                    Ändern
                </Button>
            </DialogActions>
        </Dialog>
    )
}
