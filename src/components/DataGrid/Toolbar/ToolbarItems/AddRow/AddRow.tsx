import AddIcon from "@mui/icons-material/TableRows"
import { Button } from "@mui/material"
import { useTableCtx } from "context"
import { useSnackbar } from "notistack"
import React from "react"

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
