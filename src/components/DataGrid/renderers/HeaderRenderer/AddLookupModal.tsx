import { ColumnInfo, ViewDescriptor } from "@intutable/lazy-views"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    useTheme,
} from "@mui/material"
import { PLACEHOLDER } from "api/utils/de_serialize/PLACEHOLDER_KEYS"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import React, { useEffect, useMemo, useState } from "react"
import { Column } from "types"

type AddLookupModal = {
    open: boolean
    onClose: () => void
    onAddLookupModal: (column: ColumnInfo) => unknown
    foreignView: ViewDescriptor
}

export const AddLookupModal: React.FC<AddLookupModal> = props => {
    const theme = useTheme()
    const { snackError } = useSnacki()

    const { data, error, utils } = useTable()

    const [selection, setSelection] = useState<Column | null>(null)
    const selectedColDescriptor = useMemo(
        () => (selection ? utils.getColumnInfo(selection) : undefined),
        [selection, utils]
    )

    useEffect(() => {
        if (error) {
            snackError("Die Tabelle konnte nicht geladen werden")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const onClickHandler = (column: Column) => setSelection(column)

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>
                Spalte aus verlinkter Tabelle <i>{props.foreignView.name}</i>
                als Lookup hinzufügen
            </DialogTitle>
            <DialogContent>
                {data == null && error == null ? (
                    <CircularProgress />
                ) : error ? (
                    <>Error: {error}</>
                ) : (
                    <>
                        <List>
                            {data!.columns
                                .filter(
                                    col =>
                                        col.key !== PLACEHOLDER.ROW_INDEX_KEY &&
                                        col.key !== PLACEHOLDER.COL_SELECTOR
                                )
                                .map((col, i) => (
                                    <ListItem
                                        key={i}
                                        disablePadding
                                        sx={{
                                            bgcolor:
                                                selection?.key === col.key
                                                    ? theme.palette.action
                                                          .selected
                                                    : undefined,
                                        }}
                                    >
                                        <ListItemButton
                                            onClick={onClickHandler.bind(
                                                null,
                                                col
                                            )}
                                        >
                                            <ListItemText primary={col.name} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                        </List>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <LoadingButton
                    loading={data == null && error == null}
                    loadingIndicator="Lädt..."
                    onClick={async () => {
                        await props.onAddLookupModal(selectedColDescriptor!)
                        props.onClose()
                    }}
                    disabled={selectedColDescriptor == null || error}
                >
                    Hinzufügen
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}
