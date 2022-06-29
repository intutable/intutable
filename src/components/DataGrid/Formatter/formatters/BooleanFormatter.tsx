import { FormatterComponent } from "@datagrid/Formatter"
import { Box, Checkbox } from "@mui/material"
import { Row } from "types"

/**
 * not working yet
 *
 * see
 * - https://github.com/adazzle/react-data-grid/blob/main/src/types.ts
 * - https://github.com/adazzle/react-data-grid/blob/main/website/demos/CommonFeatures.tsx
 * - https://github.com/adazzle/react-data-grid/blob/main/src/formatters/SelectCellFormatter.tsx
 * - https://github.com/adazzle/react-data-grid/blob/main/src/formatters/CheckboxFormatter.tsx
 */

export const BooleanFormatter: FormatterComponent = props => {
    const { row, column, isCellSelected } = props

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        props.onRowChange({
            ...row,
            [key]: e.target.checked,
        })

    const key = column.key as keyof Row
    const content = Boolean((row[key] as boolean | null | undefined) ?? false)

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Checkbox checked={content} onChange={handleChange} />
        </Box>
    )
}

export default BooleanFormatter
