import AddIcon from "@mui/icons-material/Add"
import {
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
export const AddLinkedCol: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    const handleOpenModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAnchorEL(event.currentTarget)
    }

    const handleCloseModal = () => setAnchorEL(null)

    const handleAddLinkedCol = () => Promise.resolve()

    return (
        <>
            <Button startIcon={<AddIcon />} onClick={handleOpenModal}>
                Add Linked Col
            </Button>
            <AddLinkedColModal
                open={anchorEL != null}
                onClose={handleCloseModal}
                onAddLinkedCol={handleAddLinkedCol}
            />
        </>
    )
}

type AddLinkedColProps = {
    open: boolean
    onClose: () => void
    onAddLinkedCol: (value: unknown) => Promise<void>
}

export const AddLinkedColModal: React.FC<AddLinkedColProps> = props => {
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
                        await props.onAddLinkedCol(0)
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
