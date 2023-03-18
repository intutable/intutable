import { useRowMask } from "context/RowMaskContext"
import { useRecordDraftSession } from "hooks/useRecordDraftSession"
import { useRow } from "hooks/useRow"
import { useView } from "hooks/useView"
import { useEffect, useState } from "react"

/** Create a new row and open it in the Row Mask */
export const usePendingRow = () => {
    const { createRow } = useRow()
    const { data } = useView()
    const { row, open } = useRowMask()
    const { addDraft } = useRecordDraftSession()

    const [pendingRow, setPendingRow] = useState<null | { _id: number }>(null)

    // open row if it was created
    useEffect(() => {
        if (pendingRow) {
            const includes = data?.rows.find(row => row._id === pendingRow._id)
            if (includes && row && row._id !== pendingRow._id) {
                open(pendingRow)
                setPendingRow(null)
            }
        }
    }, [data, open, pendingRow, row])

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
