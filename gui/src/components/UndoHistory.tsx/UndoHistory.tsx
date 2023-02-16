import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import InfoIcon from "@mui/icons-material/Info"
import KeyboardIcon from "@mui/icons-material/Keyboard"
import {
    Box,
    Divider,
    FormControlLabel,
    IconButton,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useUserSettings } from "hooks/useUserSettings"
import { useEffect, useState } from "react"
import { Memento } from "utils/UndoManager"
import { useUndoManager } from "hooks/useUndoManager"
import { sameCell, sameCellDistinctMemento } from "./sameCell"
import { MementoRow } from "./UndoHistoryRow"

export type CellID = {
    mementoID: Memento["uid"]
    rowId: number
    columnId: number
    viewId: number
}

export const UndoHistory: React.FC = () => {
    const { undoManager } = useUndoManager()
    const { userSettings } = useUserSettings()
    const theme = useTheme()

    const [hoveringOnCell, setHoveringOnCell] = useState<CellID | null>(null)

    if (undoManager?.history == null || userSettings == null) return <>Lädt...</>

    return (
        <Box>
            <Paper sx={{ p: 2 }}>
                <Toolbar>
                    <Typography sx={{ flex: "1 1 100%" }} variant="h6" component="div">
                        Versionsverlauf der Sitzung{" "}
                        <Tooltip title="Nur die aktuelle Browser-Session" arrow placement="right">
                            <InfoIcon fontSize="small" color="disabled" sx={{ cursor: "help" }} />
                        </Tooltip>
                    </Typography>
                    <IconButton>
                        <KeyboardIcon />
                    </IconButton>
                    <Divider orientation="vertical" flexItem variant="middle" sx={{ mx: 5 }} />
                    <FormControlLabel
                        control={<Switch color="primary" value={userSettings.enableUndoCache} />}
                        label="Cache aktiviert"
                        labelPlacement="start"
                    />
                    <Divider orientation="vertical" flexItem variant="middle" sx={{ mx: 5 }} />
                    <TextField
                        size="small"
                        sx={{ width: 100 }}
                        margin="none"
                        value={userSettings.undoCacheLimit}
                        label="Limit"
                        type="number"
                    />
                    <Divider orientation="vertical" flexItem variant="middle" sx={{ mx: 5 }} />
                    <Tooltip title="Cache löschen" arrow placement="bottom" enterDelay={100}>
                        <IconButton
                            size="small"
                            sx={{
                                "&:hover": {
                                    color: theme.palette.warning.dark,
                                },
                            }}
                        >
                            <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Zeitpunkt</TableCell>
                                <TableCell>Autor</TableCell>
                                <TableCell>Spalte / Zeile</TableCell>
                                <TableCell>Typ</TableCell>
                                <TableCell>Änderung</TableCell>
                                <TableCell align="right">Aktion</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {undoManager.history.mementos.length === 0 && (
                                <TableRow>
                                    <TableCell>0</TableCell>
                                    <TableCell>
                                        <Typography>Keine Einträge im Versionsverlauf.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {undoManager.history.mementos.map((memento, index) => (
                                <MementoRow
                                    memento={memento}
                                    index={index}
                                    key={memento.uid}
                                    TableRowProps={{
                                        hover: true,
                                        selected: sameCellDistinctMemento(memento, hoveringOnCell),
                                        onMouseEnter: () => {
                                            setHoveringOnCell({
                                                mementoID: memento.uid,
                                                rowId: memento.snapshot.row._id,
                                                columnId: memento.snapshot.column.id,
                                                viewId: memento.snapshot.view.id,
                                            })
                                        },
                                        onMouseLeave: () => {
                                            setHoveringOnCell(null)
                                        },
                                    }}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    )
}
