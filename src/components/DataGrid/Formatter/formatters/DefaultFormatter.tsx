import {
    ExtandableFormatterComponent,
    FormatterComponent,
} from "@datagrid/Formatter/types/FormatterComponent"
import { Box } from "@mui/material"
import { Row } from "types"

export const DefaultFormatter: ExtandableFormatterComponent = props => {
    const { row, column } = props

    const key = column.key as keyof Row
    const content = row[key] as string | null | undefined

    return (
        <Box>
            {content}
            {props.children}
        </Box>
    )
}
