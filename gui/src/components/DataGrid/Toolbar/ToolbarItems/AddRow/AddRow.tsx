import AddIcon from "@mui/icons-material/TableRows"
import { Button } from "@mui/material"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import React from "react"

/**
 * Toolbar Item for adding rows to the data grid.
 */
export const AddRow: React.FC = () => {
    const { snackError, snackSuccess } = useSnacki()

    const { createRow } = useRow()

    const handleCreateRow = async () => {
        try {
            await createRow()
            snackSuccess("Zeile hinzugefügt")
        } catch (error) {
            snackError("Die Zeile konnte nicht erstellt werden!")
        }
    }

    return (
        <Button startIcon={<AddIcon />} onClick={handleCreateRow}>
            Zeile hinzufügen
        </Button>
    )
}
