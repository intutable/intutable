import AddIcon from "@mui/icons-material/ViewColumn"
import { Button } from "@mui/material"
import React, { useState } from "react"
import { AddColumnModal } from "./AddColumnModal"

/**
 * Toolbar Item for adding cols to the data grid.
 */
const AddCol: React.FC = () => {
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
