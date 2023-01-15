import AddIcon from "@mui/icons-material/TableRows"
import { Button } from "@mui/material"
import { useRow } from "hooks/useRow"
import { useView } from "hooks/useView"
import { useSnackbar } from "notistack"
import React from "react"

/**
 * Toolbar Item for adding rows to the data grid.
 */
const AddRow: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar()

    const { createRow } = useRow()
    const { data } = useView()

    const handleCreateRow = async () => {
        try {
            const response = await createRow()
            const row = data?.rows.find(row => row._id === response._id)
            // BUG: data is not yet updated here after row creation
            // TODO: forward to the new row
        } catch (error) {
            enqueueSnackbar("Die Zeile konnte nicht erstellt werden!", {
                variant: "error",
            })
        }
    }

    return (
        <>
            <Button startIcon={<AddIcon />} onClick={handleCreateRow}>
                Neuer Eintrag
            </Button>
        </>
    )
}

export default AddRow
