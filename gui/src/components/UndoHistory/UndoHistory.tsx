import KeyIcon from "@mui/icons-material/Key"
import {
    Backdrop,
    Box,
    CircularProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useUndoManager } from "hooks/useUndoManager"
import { useUserSettings } from "hooks/useUserSettings"
import { useReducer, useState } from "react"
import { Memento } from "utils/UndoManager"
import { EmptyHistoryOverlay } from "./EmptyHistoryOverlay"
import { EverythingUndone } from "./EverythingUndone"
import { sameCellDistinctMemento } from "./sameCell"
import { UndoHistoryFooter } from "./UndoHistoryFooter"
import { UndoHistoryHead } from "./UndoHistoryHead"
import { MementoRow } from "./UndoHistoryRow"

export type CellID = {
    mementoID: Memento["uid"]
    rowId: number
    columnId: number
    viewId: number
}

export const UndoHistory: React.FC = () => {
    const { undoManager, loading } = useUndoManager()
    const { userSettings } = useUserSettings()
    const theme = useTheme()

    // BUG: useUndoManager must implement something like useSyncExternalStore
    const [, _forceUpdate] = useReducer(x => x + 1, 0)

    const [hoveringOnCell, setHoveringOnCell] = useState<CellID | null>(null)

    if (undoManager == null || userSettings == null) return <>Lädt...</>

    return (
        <Box>
            <Paper sx={{ p: 2 }}>
                <UndoHistoryHead forceUpdate={_forceUpdate} />
                <TableContainer sx={{ maxHeight: "60vh" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow
                                sx={{
                                    bgcolor: userSettings.enableUndoCache
                                        ? "inherit"
                                        : theme.palette.action.disabledBackground,
                                }}
                            >
                                <TableCell>#</TableCell>
                                <TableCell>Zeitpunkt</TableCell>
                                <TableCell>Autor</TableCell>
                                <TableCell>Ort</TableCell>
                                <TableCell>
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        Spalte /
                                        {
                                            <Tooltip
                                                title="Neben der Spalte, in der der Wert geändert wurde, werden der Wert der Primärspalte der Zeile sowie der Index angezeigt."
                                                arrow
                                                placement="top"
                                            >
                                                <KeyIcon fontSize="small" />
                                            </Tooltip>
                                        }
                                    </Stack>
                                </TableCell>
                                <TableCell>Typ</TableCell>
                                <TableCell>Änderung</TableCell>
                                <TableCell align="right">Aktion</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {undoManager.everythingUndone && <EverythingUndone />}
                            {undoManager.mementos.length === 0 && <EmptyHistoryOverlay />}
                            {undoManager.mementos.map((memento, index) => (
                                <MementoRow
                                    memento={memento}
                                    index={index}
                                    key={memento.uid}
                                    TableRowProps={{
                                        hover: userSettings.enableUndoCache,
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
                <UndoHistoryFooter />
            </Paper>
            <Backdrop open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    )
}
