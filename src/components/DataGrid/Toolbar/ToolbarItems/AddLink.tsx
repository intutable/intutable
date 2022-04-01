import AddIcon from "@mui/icons-material/Add"
import {
    Tooltip,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    useTheme,
} from "@mui/material"
import { useSnackbar } from "notistack"
import React, { useState } from "react"
import { ColumnDescriptor } from "@intutable/join-tables/dist/types"

/**
 * Toolbar Item for adding rows to the data grid.
 */
export const AddLink: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    const handleOpenModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAnchorEL(event.currentTarget)
    }

    const handleCloseModal = () => setAnchorEL(null)

    const handleAddLink = () => Promise.resolve()

    return (
        <>
            <Tooltip title="Add link to another table">
                <Button startIcon={<AddIcon />} onClick={handleOpenModal}>
                    Add Link
                </Button>
            </Tooltip>
            <AddLinkModal
                open={anchorEL != null}
                onClose={handleCloseModal}
                onAddLink={handleAddLink}
            />
        </>
    )
}

type AddLinkProps = {
    open: boolean
    onClose: () => void
    onAddLink: (value: unknown) => Promise<void>
}

export const AddLinkModal: React.FC<AddLinkProps> = props => {
    const theme = useTheme()

    const [selection, setSelection] = useState<Array<ColumnDescriptor>>([])

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>
                Spalte aus einer anderen Tablle hinzufügen
            </DialogTitle>
            <DialogContent></DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <Button
                    onClick={async () => {
                        await props.onAddLink(0)
                        props.onClose()
                    }}
                    disabled={selection.length < 1}
                >
                    Hinzufügen
                </Button>
            </DialogActions>
        </Dialog>
    )
}
