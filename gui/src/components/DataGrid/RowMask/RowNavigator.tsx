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
        const maxIndex = data.rows.length - 1
        const nextIndex =
            rowMaskState.row.index + 1 > maxIndex
                ? 0
                : rowMaskState.row.index + 1
        const previousIndex =
            rowMaskState.row.index - 1 < 0
                ? maxIndex
                : rowMaskState.row.index - 1
        setRowMaskState({
            mode: "edit",
            row: data.rows.find(
                row =>
                    row.index ===
                    (action === "next" ? nextIndex : previousIndex)
            )!,
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
