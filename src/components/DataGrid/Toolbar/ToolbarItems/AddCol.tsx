import type { PredefinedToolbarItem } from "../types"
import { Button, useTheme } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import React, { useState } from "react"
import { AddColumnModal } from "../../Column/AddColumn/AddColumnModal"

type AddColProps = {
    // addCol: <C>(col: C) => void
}

/**
 * Toolbar Item for adding cols to the data grid.
 */
const AddCol: PredefinedToolbarItem<AddColProps> = props => {
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAnchorEL(event.currentTarget)
    }
    const handleCloseModal = () => setAnchorEL(null)
    return (
        <>
            <Button startIcon={<AddIcon />} onClick={handleOpenModal}>
                Add Col
            </Button>
            <AddColumnModal
                open={anchorEL != null}
                onClose={handleCloseModal}
            />
        </>
    )
}
export default AddCol
