import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { useRowMask, NO_INPUT_MASK_DEFAULT } from "context/RowMaskContext"
import { useInputMask } from "hooks/useInputMask"
import { isTableIdOrigin, isTableNameOrigin, isViewIdOrigin } from "@shared/input-masks/utils"
import React from "react"

export const InputMaskSelect: React.FC = () => {
    const { selectedInputMask, setInputMask } = useRowMask()
    const { inputMasks } = useInputMask()

    const handleChange = (inputMaskId: string) => setInputMask(inputMaskId)

    return (
        <FormControl size="small" sx={{ mr: 2 }} color="warning">
            <InputLabel id="demo-simple-select-label">Maske</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedInputMask || NO_INPUT_MASK_DEFAULT}
                label="Maske"
                onChange={e => handleChange(e.target.value)}
            >
                <MenuItem value={NO_INPUT_MASK_DEFAULT}>Keine</MenuItem>
                {inputMasks.map(inputMask => (
                    <MenuItem key={inputMask.id} value={inputMask.id}>
                        {inputMask.name} (
                        {isTableIdOrigin(inputMask.origin) || isTableNameOrigin(inputMask.origin)
                            ? "Alle Views"
                            : `View ${
                                  isViewIdOrigin(inputMask.origin) ? inputMask.origin.viewId : inputMask.origin.viewName
                              }`}
                        )
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
