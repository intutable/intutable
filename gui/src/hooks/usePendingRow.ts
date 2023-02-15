import { useRowMask } from "context/RowMaskContext"
import { useRecordDraftSession } from "hooks/useRecordDraftSession"
import { useRow } from "hooks/useRow"
import { useView } from "hooks/useView"
import { useEffect, useState } from "react"

/** Create a new row and open it in the Row Mask */
export const usePendingRow = () => {
    const { createRow } = useRow()
    const { data } = useView()
    const { rowMaskState, setRowMaskState } = useRowMask()
    const { addDraft } = useRecordDraftSession()

    const [pendingRow, setPendingRow] = useState<null | { _id: number }>(null)

    // open row if it was created
    useEffect(() => {
        if (pendingRow) {
            const includes = data?.rows.find(row => row._id === pendingRow._id)
            if (
                includes &&
                rowMaskState.mode === "edit" &&
                rowMaskState.row._id !== pendingRow._id
            ) {
                setRowMaskState({ mode: "edit", row: pendingRow })
                setPendingRow(null)
            }
        }
    }, [data, pendingRow, rowMaskState, setRowMaskState])

    const createPendingRow = async () => {
        const response = await createRow()
        addDraft(response)
        setPendingRow(response)
    }

    return {
        createPendingRow,
        pending: pendingRow != null,
    }
}
