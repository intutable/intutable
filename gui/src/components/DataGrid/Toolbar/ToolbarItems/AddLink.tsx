import { ViewDescriptor } from "@intutable/lazy-views"
import AddIcon from "@mui/icons-material/AddLink"
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
    Tooltip,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { fetcher } from "api"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import { useTables } from "hooks/useTables"
import { useView } from "hooks/useView"
import React, { useEffect, useState } from "react"

/**
 * Toolbar Item for adding rows to the data grid.
 */
export const AddLink: React.FC = () => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }

    const handleCloseModal = () => setAnchorEL(null)

    return (
        <>
            <Tooltip title="Add link to another table">
                <LoadingButton
                    loadingIndicator="Lädt..."
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}
                >
                    Add Link
                </LoadingButton>
            </Tooltip>

            <AddLinkModal open={anchorEL != null} onClose={handleCloseModal} />
        </>
    )
}

type AddLinkModalProps = {
    open: boolean
    onClose: () => void
}

export const AddLinkModal: React.FC<AddLinkModalProps> = props => {
    const theme = useTheme()

    const { snackError, snackInfo } = useSnacki()

    const { tables, error } = useTables()
    const { data: currentTable, mutate: mutateTable } = useTable()
    const { mutate: mutateView } = useView()

    const [selection, setSelection] = useState<ViewDescriptor | null>(null)

    useEffect(() => {
        if (error) {
            snackError("Die Tabellen konnten nicht geladen werden")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const onClickHandler = (table: ViewDescriptor) => setSelection(table)

    const handleAddLink = async (table: ViewDescriptor) => {
        try {
            if (currentTable == null) throw new Error()
            await fetcher({
                url: "/api/join",
                body: {
                    tableId: currentTable.descriptor.id,
                    foreignTableId: table.id,
                },
            })
            await mutateTable()
            await mutateView()
            snackInfo("Die Tabelle wurde erfolgreich verlinkt.")
        } catch (err) {
            snackError("Die Tabelle konnte nicht verlinkt werden!")
        } finally {
            props.onClose()
        }
    }

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>Tabelle zum Verlinken auswählen</DialogTitle>
            <DialogContent>
                {tables == null && error == null ? (
                    <CircularProgress />
                ) : error ? (
                    <>Error: {error}</>
                ) : (
                    <>
                        <List>
                            {tables!.map((tbl, i) => (
                                <ListItem
                                    key={i}
                                    disablePadding
                                    sx={{
                                        bgcolor:
                                            selection?.id === tbl.id
                                                ? theme.palette.action.selected
                                                : undefined,
                                    }}
                                >
                                    <ListItemButton onClick={onClickHandler.bind(null, tbl)}>
                                        <ListItemText primary={tbl.name} />
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
                    loading={tables == null && error == null}
                    loadingIndicator="Lädt..."
                    onClick={async () => {
                        await handleAddLink(selection!)
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
