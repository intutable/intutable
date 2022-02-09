import { useTableCtx } from "@app/context/TableContext"
import { SerializedColumn } from "@app/types/types"
import AddIcon from "@mui/icons-material/Add"
import { Button } from "@mui/material"
import { useSnackbar } from "notistack"
import React, { useState } from "react"

/**
 * Toolbar Item for adding rows to the data grid.
 */
export const AddRow: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar()

    const { createRow } = useTableCtx()

    const handleCreateRow = async () => {
        try {
            await createRow()
        } catch (error) {
            enqueueSnackbar("Die Zeile konnte nicht erstellt werden!", {
                variant: "error",
            })
        }
    }

    return (
        <>
            <Button startIcon={<AddIcon />} onClick={handleCreateRow}>
                Add Row
            </Button>
        </>
    )
}
