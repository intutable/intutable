import AddIcon from "@mui/icons-material/TableRows"
import { LoadingButton } from "@mui/lab"
import { useRowMask } from "context/RowMaskContext"
import { useRecordDraftSession } from "hooks/useRecordDraftSession"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import React, { useEffect, useState } from "react"

/**
 * Toolbar Item for adding rows to the data grid.
 */
const AddRow: React.FC<{ text?: string }> = ({ text }) => {
    const { snackError, snackInfo } = useSnacki()

    const { createRow } = useRow()
    const { data } = useView()
    const { rowMaskState, setRowMaskState, appliedInputMask: selectedInputMask } = useRowMask()
    const isInputMask = selectedInputMask != null
    const { addDraft } = useRecordDraftSession()

    const [pendingRow, setPendingRow] = useState<null | { _id: number }>(null)
    // open row if it was created
    useEffect(() => {
        if (pendingRow) {
            const includes = data?.rows.find(row => row._id === pendingRow._id)
            if (includes && rowMaskState.mode === "edit" && rowMaskState.row._id !== pendingRow._id) {
                setRowMaskState({ mode: "edit", row: pendingRow })
                setPendingRow(null)
            }
        }
    }, [data, pendingRow, rowMaskState, setRowMaskState])

    const handleCreateRow = async () => {
        try {
            snackInfo("Ein neuer Eintrag wird angelegt!")
            const response = await createRow()
            if (isInputMask) {
                addDraft(response)
            }
            setPendingRow(response)
        } catch (error) {
            snackError("Die Zeile konnte nicht erstellt werden!")
        }
    }

    return (
        <>
            <LoadingButton
                loading={pendingRow != null}
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
