import HideSourceIcon from "@mui/icons-material/HideSource"
import { Button, ListItemText, MenuItem } from "@mui/material"
import React, { useState } from "react"
import { HiddenColumnsDialog } from "./HiddenColumnsDialog"

/**
 * Toolbar Item for adding rows to the data grid.
 */
export const HiddenColumns: React.FC = () => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeModal = () => setAnchorEL(null)

    return (
        <>
            <Button startIcon={<HideSourceIcon />} onClick={openModal}>
                Versteckte Spalten
            </Button>
            <HiddenColumnsDialog open={anchorEL !== null} onClose={closeModal} />
        </>
    )
}

export const HiddenColumnsMenuItem: React.FC = () => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const openModal = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        e.preventDefault()
        setAnchorEL(e.currentTarget)
    }
    const closeModal = () => setAnchorEL(null)

    return (
        <>
            <MenuItem onClick={openModal}>
                <ListItemText>Versteckte Spalten</ListItemText>
            </MenuItem>
            <HiddenColumnsDialog open={anchorEL !== null} onClose={closeModal} />
        </>
    )
}
