import { Box } from "@mui/material"
import LinearProgress, {
    LinearProgressProps,
} from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import React from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"
import Cell from "../Cell"

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

export class Percentage extends Cell {
    readonly brand = "percentage"
    label = "Percentage"

    isValid(value: unknown): boolean {
        return typeof value === "number" && value >= 0 && value <= 100
    }

    editor = (props: EditorProps<Row>) => {
        const { row, key, content } = this.destruct(props)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value as unknown as number
            if (this.isValid(value) === false) return
            props.onRowChange({
                ...row,
                [key]: value,
            })
        }

        return (
            <this.Input
                onChange={handleChange}
                type="number"
                onBlur={() => props.onClose(true)}
                value={content}
                componentsProps={{
                    input: {
                        min: 0,
                        max: 100,
                    },
                }}
            />
        )
    }

    formatter = (props: FormatterProps<Row>) => {
        const { content } = this.destruct<string | null | undefined>(props)

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
}
