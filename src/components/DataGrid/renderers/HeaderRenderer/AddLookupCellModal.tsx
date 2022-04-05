import AddIcon from "@mui/icons-material/Add"
import {
    Tooltip,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    useTheme,
    CircularProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
} from "@mui/material"
import { useSnackbar } from "notistack"
import React, { useEffect, useState } from "react"
import { JtDescriptor } from "@intutable/join-tables/dist/types"
import { useAuth, useTableCtx } from "context"
import { fetchWithUser } from "api"
import {
    ColumnDescriptor,
    ProjectDescriptor,
} from "@intutable/project-management/dist/types"
import useSWR, { unstable_serialize, useSWRConfig } from "swr"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTables } from "hooks/useTables"
import { useTableData } from "hooks/useTableData"
import { Column } from "types"
import { useSnacki } from "hooks/useSnacki"

type AddLookupCellModal = {
    open: boolean
    onClose: () => void
    onAddLookupModal: (column: ColumnDescriptor) => unknown
    foreignJt: JtDescriptor
}

export const AddLookupCellModal: React.FC<AddLookupCellModal> = props => {
    const theme = useTheme()
    const { utils } = useTableCtx()
    const { snackError } = useSnacki()

    const { data, error } = useTableData(props.foreignJt.id)

    const [selection, setSelection] = useState<ColumnDescriptor | null>(null)

    useEffect(() => {
        if (error) {
            snackError("Die Tabelle konnte nicht geladen werden")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const onClickHandler = (column: Column) => {
        const colDescriptor = utils.getColumnByKey(column.key)
        setSelection(colDescriptor)
    }

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>
                Spalte aus verlinkter Tabelle <i>{props.foreignJt.name}</i> als
                Lookup-Zelle hinzufügen
            </DialogTitle>
            <DialogContent>
                {data == null && error == null ? (
                    <CircularProgress />
                ) : error ? (
                    <>Error: {error}</>
                ) : (
                    <>
                        <List>
                            {data!.columns.map((col, i) => (
                                <ListItem
                                    key={i}
                                    disablePadding
                                    sx={{
                                        bgcolor:
                                            selection?.name === col.key
                                                ? theme.palette.action.selected
                                                : undefined,
                                    }}
                                >
                                    <ListItemButton
                                        onClick={onClickHandler.bind(null, col)}
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
                        await props.onAddLookupModal(selection!)
                        props.onClose()
                    }}
                    disabled={selection == null || error}
                >
                    Hinzufügen
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}
