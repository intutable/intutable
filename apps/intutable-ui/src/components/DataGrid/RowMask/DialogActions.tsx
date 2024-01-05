import { AddColumnModal } from "@datagrid/Toolbar/ToolbarItems/AddCol/AddColumnModal"
import { AddLinkModal } from "@datagrid/Toolbar/ToolbarItems/AddLink"
import AddBoxIcon from "@mui/icons-material/AddBox"
import AddLinkIcon from "@mui/icons-material/AddLink"
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

export const AddLinkButton: React.FC = () => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setAnchorEL(event.currentTarget)
    }
    const handleCloseModal = () => setAnchorEL(null)

    return (
        <>
            <Button
                onClick={handleOpenModal}
                startIcon={<AddLinkIcon fontSize="small" />}
                sx={{
                    alignSelf: "flex-start",
                }}
            >
                Neuer Link
            </Button>
            <AddLinkModal open={anchorEL != null} onClose={handleCloseModal} />
        </>
    )
}
