import { AddColumnModal } from "@datagrid/Toolbar/ToolbarItems/AddCol/AddColumnModal"
import AddBoxIcon from "@mui/icons-material/AddBox"
import { Button } from "@mui/material"
import React, { useState } from "react"

export const AddColumnButton: React.FC = () => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setAnchorEL(event.currentTarget)
    }
    const handleCloseModal = () => setAnchorEL(null)

    return (
        <>
            <Button
                onClick={handleOpenModal}
                startIcon={<AddBoxIcon fontSize="small" />}
                sx={{
                    alignSelf: "flex-start",
                }}
            >
                Neue Spalte
            </Button>
            <AddColumnModal open={anchorEL != null} onClose={handleCloseModal} />
        </>
    )
}
