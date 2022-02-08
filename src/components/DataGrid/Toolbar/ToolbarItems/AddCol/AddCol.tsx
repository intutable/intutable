import { useTableCtx } from "@app/context/TableContext"
import { SerializedColumn } from "@app/types/types"
import AddIcon from "@mui/icons-material/Add"
import { Button } from "@mui/material"
import { useSnackbar } from "notistack"
import React, { useState } from "react"
import type { PredefinedToolbarItem } from "../../types"
import { AddColumnModal } from "./AddColumnModal"

/**
 * Toolbar Item for adding cols to the data grid.
 */
const AddCol: PredefinedToolbarItem = () => {
    const { enqueueSnackbar } = useSnackbar()
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const handleOpenModal = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        setAnchorEL(event.currentTarget)
    }
    const handleCloseModal = () => setAnchorEL(null)

    const { createColumn, renameColumnName } = useTableCtx()

    const handleCreateColumn = async (col: SerializedColumn) => {
        try {
            // TODO: check if name or key is already taken
            await createColumn(col.key)
            await renameColumnName(col.key, col.name)
            enqueueSnackbar(`Du hast erfolgreich '${col.name}' erstellt!`, {
                variant: "success",
            })
        } catch (error) {
            enqueueSnackbar("Die Spalte konnte nicht erstellt werden!", {
                variant: "error",
            })
        }
    }

    return (
        <>
            <Button startIcon={<AddIcon />} onClick={handleOpenModal}>
                Add Col
            </Button>
            <AddColumnModal
                open={anchorEL != null}
                onClose={handleCloseModal}
                onHandleCreateColumn={handleCreateColumn}
            />
        </>
    )
}
export default AddCol
