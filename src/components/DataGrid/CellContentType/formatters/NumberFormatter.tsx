import { FormatterComponent } from "@datagrid/Formatter"
import { Box } from "@mui/material"
import { Row } from "types"

export const NumberFormatter: FormatterComponent = props => {
    const { row, column } = props

    const key = column.key as keyof Row
    const content = row[key] as string | null | undefined

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                textAlign: "right",
            }}
        >
            {content}
        </Box>
    )
}

export default NumberFormatter
