import { AddColumnModal } from "@datagrid/Toolbar/ToolbarItems/AddCol/AddColumnModal"
import AddBoxIcon from "@mui/icons-material/AddBox"
import { Button } from "@mui/material"
import { useSnacki } from "hooks/useSnacki"
import React, { useState } from "react"

export const AddColumnButton: React.FC = () => {
    const { snackError } = useSnacki()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAnchorEL(event.currentTarget)
    }
    const handleCloseModal = () => setAnchorEL(null)

    return (
        <>
            <Button
                onClick={handleOpenModal}
                startIcon={<AddBoxIcon fontSize="small" />}
                variant="contained"
                size="small"
                fullWidth
                color="info"
                sx={{
                    letterSpacing: 1,
                    mt: 10,
                    opacity: 0.6,
                }}
            >
                Spalte hinzufügen
            </Button>
            <AddColumnModal
                open={anchorEL != null}
                onClose={handleCloseModal}
            />
        </>
    )
}
