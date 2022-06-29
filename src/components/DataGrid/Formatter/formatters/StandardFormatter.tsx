import { FormatterComponent } from "@datagrid/Formatter"
import { Box } from "@mui/material"
import { Row } from "types"

export const StandardFormatter: FormatterComponent = props => {
    const { row, column } = props

    const key = column.key as keyof Row
    const content = row[key] as string | null | undefined

    return <Box>{content}</Box>
}

export default StandardFormatter
