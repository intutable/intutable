import AddIcon from "@mui/icons-material/TableRows"
import { LoadingButton } from "@mui/lab"
import { usePendingRow } from "hooks/usePendingRow"
import { useSnacki } from "hooks/useSnacki"
import React from "react"

/**
 * Toolbar Item for adding rows to the data grid.
 */
const AddRow: React.FC<{ text?: string }> = ({ text }) => {
    const { snackError, snackInfo } = useSnacki()

    const { createPendingRow, pending } = usePendingRow()

    const handleCreateRow = async () => {
        try {
            snackInfo("Ein neuer Eintrag wird angelegt!")
            await createPendingRow()
        } catch (error) {
            snackError("Die Zeile konnte nicht erstellt werden!")
        }
    }

    return (
        <>
            <LoadingButton
                loading={pending}
                loadingIndicator={"Wird erstellt ..."}
                startIcon={<AddIcon />}
                onClick={handleCreateRow}
            >
                {text || "Neuer Eintrag"}
            </LoadingButton>
        </>
    )
}

export default AddRow
