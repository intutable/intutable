import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { useRowMask } from "context/RowMaskContext"
import { useInputMask } from "hooks/useInputMask"

export const InputMaskSelect: React.FC = props => {
    const { rowMaskState } = useRowMask()
    const {} = useInputMask()

    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Eingabemaske</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={age}
                label="Eingabemaske"
                onChange={handleChange}
            >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
            </Select>
        </FormControl>
    )
}
