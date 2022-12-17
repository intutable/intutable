import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { useRowMask, ROW_MASK_FALLBACK_VALUE } from "context/RowMaskContext"
import { useInputMask } from "hooks/useInputMask"
import { isTableOrigin } from "@shared/input-masks/utils"

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
                value={selectedInputMask || ROW_MASK_FALLBACK_VALUE}
                label="Maske"
                onChange={e => handleChange(e.target.value)}
            >
                <MenuItem value={ROW_MASK_FALLBACK_VALUE}>Default</MenuItem>
                {inputMasks.map(inputMask => (
                    <MenuItem key={inputMask.id} value={inputMask.id}>
                        {inputMask.name} (
                        {isTableOrigin(inputMask.origin) ? "Alle Views" : `View ${inputMask.origin.viewId}`})
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
