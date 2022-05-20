import { JoinDescriptor, ViewDescriptor } from "@intutable/lazy-views"
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
import { fetcher } from "api"
import { useUser } from "auth"
import { getRowId } from "hooks/useRow"
import { useTable } from "hooks/useTable"
import { useSnackbar } from "notistack"
import React, { useEffect, useState } from "react"
import useSWR from "swr"
import { TableData } from "types"

export type RowPreview = {
    id: number
    text: string
}

export type RowSelectorProps = {
    rowId: number
    join: JoinDescriptor
    foreignTable: ViewDescriptor
    open: boolean
    onClose: () => void
}

export const RowSelector: React.FC<RowSelectorProps> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const { data: baseTableData, mutate } = useTable()

    const { data: linkTableData, error } = useTable({
        table: props.foreignTable,
    })

    const [options, setOptions] = useState<RowPreview[]>([])
    const [selection, setSelection] = useState<RowPreview | null>(null)

    // get data from target table and generate previews of rows
    useEffect(() => {
        if (linkTableData == null) setOptions([])
        else {
            const primaryColumn = linkTableData!.metadata.columns.find(
                c => c.attributes.userPrimary! === 1
            )!
            setOptions(
                linkTableData!.rows.map(r => ({
                    id: getRowId(linkTableData, r),
                    text: r[primaryColumn.key] as string,
                }))
            )
        }
    }, [linkTableData])

    const handlePickRow = async () => {
        try {
            await fetcher({
                url: `/api/join/${props.join.id}`,
                body: {
                    viewId: baseTableData!.metadata.descriptor.id,
                    rowId: props.rowId,
                    value: selection?.id,
                },
            })
            await mutate()
        } catch (err) {
            enqueueSnackbar("Die Zeile konnte nicht hinzugefügt werden!", {
                variant: "error",
            })
        } finally {
            props.onClose()
        }
    }

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>Wähle eine Zeile</DialogTitle>
            <DialogContent>
                {linkTableData == null && error == null ? (
                    <CircularProgress />
                ) : error ? (
                    <>Error: {error}</>
                ) : (
                    <>
                        <List>
                            {options
                                .filter(row => row.text != null)
                                .map(row => (
                                    <ListItem
                                        key={row.id}
                                        disablePadding
                                        sx={{
                                            bgcolor:
                                                selection?.id === row.id
                                                    ? theme.palette.action
                                                          .selected
                                                    : undefined,
                                        }}
                                    >
                                        <ListItemButton
                                            onClick={() => setSelection(row)}
                                        >
                                            <ListItemText primary={row.text} />
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
                    loading={linkTableData?.rows == null && error == null}
                    loadingIndicator="Lädt..."
                    onClick={handlePickRow}
                    disabled={selection == null || error}
                >
                    Hinzufügen
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}
