import { useRowMask } from "context/RowMaskContext"
import { useRecordDraftSession } from "hooks/useRecordDraftSession"
import { useRow } from "hooks/useRow"
import { useView } from "hooks/useView"
import { useEffect, useState } from "react"
import { useSnacki } from "./useSnacki"

/** Create a new row and open it in the Row Mask */
export const usePendingRow = () => {
    const { createRow } = useRow()
    const { data } = useView()
    const { snackError } = useSnacki()
    const { row, open } = useRowMask()
    const { addDraft } = useRecordDraftSession()

    const [pendingRow, setPendingRow] = useState<null | { _id: number }>(null)

    const [loading, setLoading] = useState<boolean>(false)

    // open row if it was created
    useEffect(() => {
        if (pendingRow) {
            const includes = data?.rows.find(row => row._id === pendingRow._id)
            if (includes && row && row._id !== pendingRow._id) {
                open(pendingRow)
                setPendingRow(null)
                setLoading(false)
            }
        }
    }, [data, open, pendingRow, row])

    const createPendingRow = async () => {
        try {
            setLoading(true)
            const response = await createRow()
            addDraft(response)
            setPendingRow(response)
        } catch (error) {
            setLoading(false)
            snackError("Es konnte kein neuer Eintrag erstellt werden.")
        }
    }

    return {
        createPendingRow,
        loading,
        /**
         * @deprecated instead use `loading`
         *
         * // BUG: this will only be true for a few sec since its updated after the async operation
         * */
        pending: pendingRow != null,
    }
}
