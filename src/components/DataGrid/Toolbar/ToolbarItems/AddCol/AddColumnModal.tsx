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
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material"
import sanitizeName from "utils/sanitizeName"
import HelpIcon from "@mui/icons-material/Help"

const CellContentTypeDisplayName: {
    [key in CellContentType]: string
} = {
    string: "Freitexteingabe (String)",
    number: "Dezimalzahlen",
    percentage: "Prozent",
    currency: "Währung",
    boolean: "Boolescher Wert / Checkbox",
    date: "Datum",
    datetime: "Datum & Zeit",
    time: "Zeit",
    avatar: "Avatar",
    link: "Link",
    email: "E-Mail",
    select: "Auswahlliste",
    multiSelect: "Auswahlliste",
    complex: "Komplexer Typ",
} as const

type AddColumnModalProps = {
    open: boolean
    onClose: () => void
    onHandleCreateColumn: (column: Column.Serialized) => Promise<void>
}

export const AddColumnModal: React.FC<AddColumnModalProps> = props => {
    const theme = useTheme()

    const [moreOptionsActive, setMoreOptionsActive] = useState(false)
    const [options, setOptions] = useState<Column.Serialized>({
        _id: -1,
        _kind: "standard",
        key: "",
        name: "",
        editable: true,
        editor: "string",
        formatter: "standard",
    })
    const [valid, setValid] = useState(false)

    useEffect(() => {
        if (options.name.length > 0) setValid(true)
        setOption("key", sanitizeName(options.name))
    }, [options.name])

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
                                value={options.editor}
                                onChange={e => {
                                    setOption(
                                        "editor",
                                        e.target.value as CellContentType
                                    )
                                    setOption(
                                        "formatter",
                                        e.target.value as CellContentType
                                    )
                                }}
                            >
                                {Runtime_CellContentType.map((type, i) => (
                                    <MenuItem
                                        key={i}
                                        value={type}
                                        disabled={
                                            type !== "string" &&
                                            type !== "email" &&
                                            type !== "boolean"
                                        }
                                    >
                                        {CellContentTypeDisplayName[type]}
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
                    {moreOptionsActive && (
                        // Editable
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
                        // Frozen
                        // Resizable
                        // sortable
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
