import { ViewDescriptor } from "@intutable/lazy-views"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
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
    useTheme,
} from "@mui/material"
import { fetcher } from "api"
import { useTableCtx } from "context"
import { useTables } from "hooks/useTables"
import { useSnackbar } from "notistack"
import React, { useEffect, useState } from "react"

/**
 * Toolbar Item for adding rows to the data grid.
 */
export const AddLink: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar()

    const { data: currentTable, project, utils } = useTableCtx()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }

    const handleCloseModal = () => setAnchorEL(null)

    const handleAddLink = async (table: ViewDescriptor) => {
        try {
            if (currentTable == null) throw new Error()
            await fetcher({
                url: "/api/join",
                body: {
                    viewId: currentTable.metadata.descriptor.id,
                    foreignViewId: table.id,
                },
            })
            await utils.mutate()
            enqueueSnackbar("Die Tabelle wurde erfolgreich verlinkt.", {
                variant: "success",
            })
        } catch (err) {
            enqueueSnackbar("Die Tabelle konnte nicht verlinkt werden!", {
                variant: "error",
            })
        } finally {
            handleCloseModal()
        }
    }

    return (
        <>
            <Tooltip title="Add link to another table">
                <LoadingButton
                    loading={currentTable == null}
                    loadingIndicator="Lädt..."
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}
                >
                    Add Link
                </LoadingButton>
            </Tooltip>
            {currentTable && (
                <AddLinkModal
                    table={currentTable.metadata.descriptor}
                    project={project}
                    open={anchorEL != null}
                    onClose={handleCloseModal}
                    onAddLink={handleAddLink}
                />
            )}
        </>
    )
}

type AddLinkModalProps = {
    project: ProjectDescriptor
    table: ViewDescriptor
    open: boolean
    onClose: () => void
    onAddLink: (table: ViewDescriptor) => unknown
}

export const AddLinkModal: React.FC<AddLinkModalProps> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const { tables, error } = useTables(props.project)

    const [selection, setSelection] = useState<ViewDescriptor | null>(null)

    useEffect(() => {
        if (error) {
            enqueueSnackbar("Die Tabellen konnten nicht geladen werden", {
                variant: "error",
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const onClickHandler = (table: ViewDescriptor) => setSelection(table)

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
                                    <ListItemButton
                                        onClick={onClickHandler.bind(null, tbl)}
                                    >
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
                        await props.onAddLink(selection!)
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
