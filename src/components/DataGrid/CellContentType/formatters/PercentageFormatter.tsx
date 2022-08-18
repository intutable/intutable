import { FormatterComponent } from "@datagrid/Formatter"
import { Box } from "@mui/material"
import { Row } from "types"
import LinearProgress, {
    LinearProgressProps,
} from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"

const LinearProgressWithLabel = (
    props: LinearProgressProps & { value: number }
) => (
    <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Box sx={{ width: "100%", mr: 1 }}>
            <LinearProgress
                variant="determinate"
                sx={{
                    borderRadius: 100,
                }}
                {...props}
            />
        </Box>
        <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
                {props.value} %
            </Typography>
        </Box>
    </Box>
)

export const PercentageFormatter: FormatterComponent = props => {
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
            {content && <LinearProgressWithLabel value={Number(content)} />}
        </Box>
    )
}

export default PercentageFormatter
