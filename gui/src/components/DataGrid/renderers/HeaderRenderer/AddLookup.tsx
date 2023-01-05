import LookupIcon from "@mui/icons-material/ManageSearch"
import LoadingButton from "@mui/lab/LoadingButton"
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { fetcher } from "api/fetcher"
import { useSnacki } from "hooks/useSnacki"
import { useTable } from "hooks/useTable"
import { useView } from "hooks/useView"
import React, { useEffect, useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Column, Row } from "types"

import { useForeignTable } from "hooks/useForeignTable"
import { useLink } from "hooks/useLink"
import { TableColumn } from "types"
import { ColumnUtility } from "utils/column utils/ColumnUtility"

type ModalProps = {
    column: Column.Deserialized
    open: boolean
    onClose: () => void
}

const Modal: React.FC<ModalProps> = props => {
    const theme = useTheme()
    const { snackError } = useSnacki()

    const { foreignTable, join } = useForeignTable(props.column)
    const { linkTableData: foreignTableData, error } = useLink(props.column)

    const { data, mutate: mutateTable } = useTable()
    const { mutate: mutateView } = useView()

    const [selection, setSelection] = useState<TableColumn | null>(null)

    const handleAddLookup = async (column: TableColumn) => {
        try {
            const joinId = join!.id
            await fetcher({
                url: `/api/lookupField/${column.id}`,
                body: {
                    tableId: data!.descriptor.id,
                    joinId,
                },
            })
            await mutateTable()
            await mutateView()
            props.onClose()
        } catch (error) {
            snackError("Der Lookup konnte nicht hinzugefügt werden!")
        }
    }

    useEffect(() => {
        if (error) {
            snackError("Die Tabelle konnte nicht geladen werden")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error])

    const onClickHandler = (column: TableColumn) => setSelection(column)

    if (foreignTable == null) return null

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>
                Spalte aus verlinkter Tabelle <i>{foreignTable.name}</i> als Lookup hinzufügen
            </DialogTitle>
            <DialogContent>
                {foreignTableData == null && error == null ? (
                    <CircularProgress />
                ) : error ? (
                    <>Error: {error}</>
                ) : (
                    <>
                        <List>
                            {foreignTableData!.columns
                                .filter(c => !ColumnUtility.isAppColumn(c))
                                .map((col, i) => (
                                    <ListItem
                                        key={i}
                                        disablePadding
                                        sx={{
                                            bgcolor:
                                                selection?.key === col.key ? theme.palette.action.selected : undefined,
                                        }}
                                    >
                                        <ListItemButton onClick={onClickHandler.bind(null, col)}>
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
                    loading={foreignTableData == null && error == null}
                    loadingIndicator="Lädt..."
                    onClick={async () => {
                        await handleAddLookup(selection!)
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

export type AddLookupProps = {
    headerRendererProps: HeaderRendererProps<Row>
}

export const AddLookup: React.FC<AddLookupProps> = props => {
    const { headerRendererProps } = props

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    const openModal = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeModal = () => setAnchorEL(null)

    return (
        <>
            <MenuItem onClick={openModal}>
                <ListItemIcon>
                    <LookupIcon />
                </ListItemIcon>
                <ListItemText>Lookup hinzufügen</ListItemText>
            </MenuItem>

            <Modal open={anchorEL != null} onClose={closeModal} column={headerRendererProps.column} />
        </>
    )
}

export const AddLookupButton: React.FC<{ column: Column.Deserialized }> = ({ column }) => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeContextMenu = () => setAnchorEL(null)

    return (
        <>
            <IconButton onClick={openContextMenu} size="small" color="primary" edge="end">
                <LookupIcon fontSize="small" />
            </IconButton>

            <Modal open={anchorEL != null} onClose={closeContextMenu} column={column} />
        </>
    )
}
