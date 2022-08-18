import { FormatterComponent } from "@datagrid/Formatter"
import { Box, Checkbox } from "@mui/material"
import { Row } from "types"

export const BooleanFormatter: FormatterComponent = props => {
    const { row, column } = props

    const key = column.key as keyof Row
    const content = row[key] === "true"

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked !== content)
            props.onRowChange({
                ...row,
                [key]: Boolean(e.target.checked).toString(),
            })
    }

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
