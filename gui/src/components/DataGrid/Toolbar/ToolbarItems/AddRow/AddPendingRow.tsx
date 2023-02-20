import AddIcon from "@mui/icons-material/TableRows"
import { LoadingButton } from "@mui/lab"
import { usePendingRow } from "hooks/usePendingRow"
import { useSnacki } from "hooks/useSnacki"
import React from "react"

export const AddPendingRow: React.FC<{ text?: string }> = ({ text }) => {
    const { snackError, snackInfo, snackSuccess } = useSnacki()

    const { createPendingRow, pending } = usePendingRow()

    const handleCreateRow = async () => {
        try {
            snackInfo("Ein neuer Eintrag wird angelegt!")
            await createPendingRow()
            snackSuccess("Neuer Eintrag erstellt!")
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