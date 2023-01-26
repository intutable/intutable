import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import { Stack } from "@mui/material"
import { useRowMask } from "context/RowMaskContext"
import { useView } from "hooks/useView"
import React from "react"

const _RowNavigator: React.FC = () => {
    const { data } = useView()
    const { rowMaskState, setRowMaskState } = useRowMask()

    const navigateRow = (action: "next" | "previous") => {
        if (rowMaskState.mode !== "edit" || data == null) return
        const selectedRow = data?.rows.find(row => row._id === rowMaskState.row._id)
        if (selectedRow == null) return

        const maxIndex = data.rows.length - 1
        const nextIndex = selectedRow.index + 1 > maxIndex ? 0 : selectedRow.index + 1
        const previousIndex = selectedRow.index - 1 < 0 ? maxIndex : selectedRow.index - 1

        setRowMaskState({
            mode: "edit",
            row: { _id: data.rows.find(row => row.index === (action === "next" ? nextIndex : previousIndex))!._id },
        })
    }

    return (
        <Stack
            sx={{
                mr: 1,
            }}
        >
            <ArrowDropUpIcon
                fontSize="small"
                sx={{
                    cursor: "pointer",
                    p: 0,
                }}
                onClick={() => navigateRow("previous")}
            />
            <ArrowDropDownIcon
                fontSize="small"
                sx={{
                    cursor: "pointer",
                }}
                onClick={() => navigateRow("next")}
            />
        </Stack>
    )
}

export const RowNavigator = React.memo(_RowNavigator)
