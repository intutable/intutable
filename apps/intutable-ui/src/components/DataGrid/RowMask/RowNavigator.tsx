import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import { Stack } from "@mui/material"
import { useConstraintValidation } from "context/ConstraintValidationContext"
import { useRowMask } from "context/RowMaskContext"
import { useView } from "hooks/useView"
import React from "react"
import { useTheme } from "@mui/material/styles"
import { useSnacki } from "hooks/useSnacki"

const _RowNavigator: React.FC = () => {
    const { data } = useView()
    const { row, open } = useRowMask()
    const { snackError } = useSnacki()
    const { state } = useConstraintValidation()
    const theme = useTheme()

    const navigateRow = (action: "next" | "previous") => {
        if (state.isRunning) return
        if (!row || data == null) return
        const selectedRow = row

        const maxIndex = data.rows.length - 1
        const nextIndex = selectedRow.index + 1 > maxIndex ? 0 : selectedRow.index + 1
        const previousIndex = selectedRow.index - 1 < 0 ? maxIndex : selectedRow.index - 1

        // if (isValid === false)
        //     alert("Die Eingaben sind nicht gültig. Bitte korrigieren Sie die Fehler.")

        const next = data.rows.find(
            row => row.index === (action === "next" ? nextIndex : previousIndex)
        )
        if (!next) {
            snackError("Der Eintrag konnte nicht gewechselt werden!")
            return
        }
        open(next)
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
                    color: state.isRunning ? theme.palette.action.disabled : undefined,
                    p: 0,
                }}
                onClick={() => navigateRow("previous")}
            />
            <ArrowDropDownIcon
                fontSize="small"
                sx={{
                    cursor: "pointer",
                    color: state.isRunning ? theme.palette.action.disabled : undefined,
                }}
                onClick={() => navigateRow("next")}
            />
        </Stack>
    )
}

export const RowNavigator = React.memo(_RowNavigator)