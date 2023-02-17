import {
    Box,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useUndoManager } from "hooks/useUndoManager"
import { useUserSettings } from "hooks/useUserSettings"
import { useEffect, useState } from "react"
import { Memento } from "utils/UndoManager"
import { EmptyHistoryOverlay } from "./EmptyHistoryOverlay"
import { sameCellDistinctMemento } from "./sameCell"
import { UndoHistoryHead } from "./UndoHistoryHead"
import { MementoRow } from "./UndoHistoryRow"
import KeyIcon from "@mui/icons-material/Key"

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
        console.log(userSettings)
    }, [userSettings])

    if (undoManager == null || userSettings == null) return <>Lädt...</>

    return (
        <Box>
            <Paper sx={{ p: 2 }}>
                <UndoHistoryHead />

                <TableContainer>
                    <Table>
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
                            {undoManager.mementos.length === 0 && <EmptyHistoryOverlay />}
                            {undoManager.mementos.map((memento, index) => (
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
