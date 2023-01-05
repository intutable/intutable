import { Cell } from "@datagrid/Cells/abstract/Cell"
import { JoinDescriptor, ViewDescriptor } from "@intutable/lazy-views"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { RowPreview, useLink } from "hooks/useLink"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import { useView } from "hooks/useView"
import React, { useState } from "react"
import { Row } from "types"
import { Column } from "types/tables/rdg"
import { ColumnUtility } from "utils/column utils/ColumnUtility"

export type RowSelectorProps = {
    row: Row
    join: JoinDescriptor
    foreignTable: ViewDescriptor
    open: boolean
    onClose: () => void
    column: Column
}

export const RowSelector: React.FC<RowSelectorProps> = props => {
    const theme = useTheme()
    const { snackError } = useSnacki()

    const { data: baseTableData, mutate: mutateTable } = useTable()
    const { mutate: mutateView } = useView()
    const { error, rowPreviews, setLinkValue } = useLink(props.column)

    const content = props.row[props.column.key]
    const hasSelection = Cell.isEmpty(content) ? false : rowPreviews?.find(row => row.content === content)
    const [selection, setSelection] = useState<RowPreview | null>(hasSelection || null)

    const handlePickRow = async () => {
        try {
            await setLinkValue(props.row, selection)
            await mutateTable()
            await mutateView()
        } catch (err) {
            snackError("Die Zeile konnte nicht hinzugefügt werden!")
        } finally {
            props.onClose()
        }
    }

    if (rowPreviews == null) return null

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>
                Verlinke eine Zeile aus <i>{props.column.name}</i> ({props.foreignTable.name}) mit der Zeile{" "}
                {props.row.index} ({baseTableData?.descriptor.name}).
            </DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Index</TableCell>
                                <TableCell>Inhalt</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rowPreviews!
                                .filter(row => Cell.isEmpty(row.content) === false)
                                .sort(ColumnUtility.sortByIndex)
                                .map(row => (
                                    <TableRow
                                        key={row._id}
                                        onClick={() => setSelection(row)}
                                        sx={{
                                            cursor: "pointer",
                                            "&:hover": {
                                                bgcolor: theme.palette.action.hover,
                                            },
                                            bgcolor:
                                                selection?._id === row._id ? theme.palette.action.selected : undefined,
                                        }}
                                    >
                                        <TableCell>{row.index}</TableCell>
                                        <TableCell>{row.content as string}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <LoadingButton
                    loading={rowPreviews == null && error == null}
                    loadingIndicator="Lädt..."
                    onClick={handlePickRow}
                    disabled={selection == null || error}
                >
                    Verlinken
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}

export default RowSelector
