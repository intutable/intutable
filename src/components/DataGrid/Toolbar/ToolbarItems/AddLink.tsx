import AddIcon from "@mui/icons-material/AddLink"
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
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import useSWR, { unstable_serialize, useSWRConfig } from "swr"
import LoadingButton from "@mui/lab/LoadingButton"
import { useTables } from "hooks/useTables"

/**
 * Toolbar Item for adding rows to the data grid.
 */
export const AddLink: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar()
    const { mutate } = useSWRConfig()

    const { data: currentTable, project } = useTableCtx()
    const { user } = useAuth()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }

    const handleCloseModal = () => setAnchorEL(null)

    const handleAddLink = async (table: JtDescriptor) => {
        try {
            if (currentTable == null || user == null) throw new Error("A")
            await fetchWithUser(
                "/api/join",
                user,
                {
                    jtId: currentTable.metadata.descriptor.id,
                    foreignJtId: table.id,
                },
                "POST"
            )
            await mutate(
                unstable_serialize([
                    `/api/table/${currentTable.metadata.descriptor.id}`,
                    user,
                    undefined,
                    "GET",
                ])
            )
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
            <AddLinkModal
                table={currentTable!.metadata.descriptor}
                project={project}
                open={anchorEL != null}
                onClose={handleCloseModal}
                onAddLink={handleAddLink}
            />
        </>
    )
}

type AddLinkModalProps = {
    project: ProjectDescriptor
    table: JtDescriptor
    open: boolean
    onClose: () => void
    onAddLink: (table: JtDescriptor) => unknown
}

export const AddLinkModal: React.FC<AddLinkModalProps> = props => {
    const theme = useTheme()
    const { user } = useAuth()
    const { enqueueSnackbar } = useSnackbar()

    const { tables, error } = useTables(props.project)

    const [selection, setSelection] = useState<JtDescriptor | null>(null)

    useEffect(() => {
        if (error) {
            enqueueSnackbar("Die Tabellen konnten nicht geladen werden", {
                variant: "error",
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const onClickHandler = (table: JtDescriptor) => setSelection(table)

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
