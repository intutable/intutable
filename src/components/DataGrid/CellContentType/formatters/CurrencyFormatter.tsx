import { FormatterComponent } from "@datagrid/Cells/types/FormatterComponent"
import { Box } from "@mui/material"
import { Row } from "types"

export const CurrencyFormatter: FormatterComponent = props => {
    const { row, column } = props

    const key = column.key as keyof Row
    const content = row[key] as string | null | undefined

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                whiteSpace: "nowrap",
            }}
        >
            {content}
            {content && " €"}
        </Box>
    )
}

export default CurrencyFormatter
