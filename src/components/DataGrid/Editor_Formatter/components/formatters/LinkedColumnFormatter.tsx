import { Formatter } from "@datagrid/Editor_Formatter/types/Formatter"
import { JtDescriptor } from "@intutable/join-tables/dist/types"
import {
    ColumnDescriptor,
    TableData,
} from "@intutable/project-management/dist/types"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Box,
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
import { fetchWithUser } from "api"
import { useAuth } from "context"
import { useSnackbar } from "notistack"
import React, { useState } from "react"
import useSWR from "swr"

type ColumnPickerProps = {
    table: JtDescriptor
    open: boolean
    onClose: () => void
}

const ColumnPicker: React.FC<ColumnPickerProps> = props => {
    const { user } = useAuth()
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const { data, error } = useSWR<TableData>(
        user ? [`/api/table/${props.table.id}`, user, undefined, "GET"] : null,
        fetchWithUser
    )

    //     const data = fetch(...)
    // const idColumn = data.columns.find(c => c.name === PM.UID_KEY)!
    //     const nameColumn = data.columns.find(c => c.attributes.userPrimary! === 1)!
    // selectOptions = data.rows.map(r => { id: r[idColumn.key], text: r[nameColumn.key] })

    const [selection, setSelection] = useState<ColumnDescriptor | null>(null)

    const handlePickColumn = async () => {
        try {
            enqueueSnackbar("Die X wurde erfolgreich hinzugefügt.", {
                variant: "success",
            })
        } catch (err) {
            enqueueSnackbar("Die X konnte nicht hinzugefügt werden!", {
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
                {(data == null || data.columns == null) && error == null ? (
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
                                            selection?.id === col.id
                                                ? theme.palette.action.selected
                                                : undefined,
                                    }}
                                >
                                    <ListItemButton
                                        onClick={() => setSelection(col)}
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
                    loading={data?.columns == null && error == null}
                    loadingIndicator="Lädt..."
                    onClick={handlePickColumn}
                    disabled={selection == null || error}
                >
                    Hinzufügen
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}

export const LinkColumnFormatter: Formatter = props => {
    const { column } = props

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }

    const handleCloseModal = () => setAnchorEL(null)

    return (
        <>
            <Tooltip enterDelay={1000} arrow title="Lookup-Feld hinzufügen">
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        cursor: "cell",
                    }}
                    onClick={handleOpenModal}
                ></Box>
            </Tooltip>
            <ColumnPicker
                table={{ id: 1, name: "A" }} // TODO: how do i calc the derived table?!
                open={anchorEL != null}
                onClose={handleCloseModal}
            />
        </>
    )
}

// export const LinkedColumnFormatter = React.memo(_LinkedColumnFormatter)
