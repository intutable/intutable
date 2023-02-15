import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { useRowMask } from "context/RowMaskContext"
import { useInputMask } from "hooks/useInputMask"
import { isTableIdOrigin, isTableNameOrigin, isViewIdOrigin } from "@shared/input-masks/utils"
import React from "react"

export const DevOverlay: React.FC = () => {
    const { appliedInputMask, setInputMask } = useRowMask()
    const { inputMasks } = useInputMask()

    const handleChange = (inputMaskId: string) =>
        setInputMask(inputMaskId === "none" ? null : inputMaskId)

    return (
        <FormControl size="small" sx={{ mr: 2 }} color="warning">
            <InputLabel id="dev-overlay">Maske</InputLabel>
            <Select
                labelId="dev-overlay"
                id="dev-overlay"
                value={appliedInputMask || "none"}
                label="Maske"
                onChange={e => handleChange(e.target.value)}
            >
                <MenuItem value="none">Keine</MenuItem>
                {inputMasks.map(inputMask => (
                    <MenuItem key={inputMask.id} value={inputMask.id}>
                        {inputMask.name} (
                        {isTableIdOrigin(inputMask.origin) || isTableNameOrigin(inputMask.origin)
                            ? "Alle Views"
                            : `View ${
                                  isViewIdOrigin(inputMask.origin)
                                      ? inputMask.origin.viewId
                                      : inputMask.origin.viewName
                              }`}
                        )
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
