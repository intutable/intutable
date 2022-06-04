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
import { isAppColumn } from "api/utils/de_serialize/column"
import { useLink } from "hooks/useLink"
import { useSnacki } from "hooks/useSnacki"
import React, { useEffect, useMemo, useState } from "react"
import { TableColumn } from "types"

type AddLookupModal = {
    open: boolean
    onClose: () => void
    onAddLookupModal: (column: ColumnInfo) => unknown
    foreignTable: ViewDescriptor
}

export const AddLookupModal: React.FC<AddLookupModal> = props => {
    const theme = useTheme()
    const { snackError } = useSnacki()

    const {
        linkTableData: data,
        error,
        getColumn,
    } = useLink({ table: props.foreignTable })

    const [selection, setSelection] = useState<TableColumn | null>(null)
    const selectedColDescriptor = useMemo(
        () => (selection && data ? getColumn(selection) : null),
        [data, selection, getColumn]
    )

    useEffect(() => {
        if (error) {
            snackError("Die Tabelle konnte nicht geladen werden")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const onClickHandler = (column: TableColumn) => {
        setSelection(column)
    }

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>
                Spalte aus verlinkter Tabelle <i>{props.foreignTable.name}</i>{" "}
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
                                .filter(c => !isAppColumn(c))
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
