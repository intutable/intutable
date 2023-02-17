import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useUndoManager } from "hooks/useUndoManager"
import { useUserSettings } from "hooks/useUserSettings"
import { useEffect, useState } from "react"
import { Memento } from "utils/UndoManager"
import { sameCellDistinctMemento } from "./sameCell"
import { UndoHistoryHead } from "./UndoHistoryHead"
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

    const disabled = userSettings?.enableUndoCache === false

    useEffect(() => {
        console.log(userSettings?.enableUndoCache)
    }, [userSettings?.enableUndoCache])

    if (undoManager?.history == null || userSettings == null) return <>Lädt...</>

    return (
        <Box>
            <Paper sx={{ p: 2 }}>
                <UndoHistoryHead />

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
                                        sx: {
                                            bgcolor: disabled
                                                ? theme.palette.action.disabled
                                                : "inherit",
                                        },
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
