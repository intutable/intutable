import { Box } from "@mui/material"
import LinearProgress, {
    LinearProgressProps,
} from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import React from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"
import { NumericCell } from "../abstract/NumericCell"
import PercentIcon from "@mui/icons-material/Percent"

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

export class Percentage extends NumericCell {
    readonly brand = "percentage"
    label = "Percentage"
    icon = PercentIcon

    isValid(value: unknown): boolean {
        return typeof value === "number" && value >= 0 && value <= 100
    }

    export(value: number): string {
        return value + "%"
    }
    unexport(value: string): number {
        const unexported = Number(value.replace("%", "").trim())
        if (NumericCell.isNumeric(unexported) === false)
            throw new RangeError(
                "Percentage Cell Debug Error: value is not a number"
            )
        return unexported
    }

    editor = (props: EditorProps<Row>) => {
        const { row, key, content } = this.destruct<number | null>(props)

        const [percentage, setPercentage] = React.useState<number | null>(
            content
        )

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            let parsedValue: number | null

            // parse
            try {
                if (
                    value === null ||
                    (typeof value === "string" && value === "")
                )
                    parsedValue = null // return null instead of an empty string
                else parsedValue = Number.parseInt(value)
            } catch (e) {
                return
            }

            // validate AND update
            if (parsedValue === null || this.isValid(parsedValue)) {
                setPercentage(parsedValue)
                props.onRowChange({
                    ...row,
                    [key]: parsedValue,
                })
            }
        }

        return (
            <this.Input
                onChange={handleChange}
                type="number"
                onBlur={() => props.onClose(true)}
                value={percentage}
                // componentsProps={{
                //     input: {
                //         min: 0,
                //         max: 100,
                //     },
                // }}
            />
        )
    }

    formatter = (props: FormatterProps<Row>) => {
        const { content } = this.destruct<number | null>(props)

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
                {this.isValid(content) && (
                    <LinearProgressWithLabel value={content!} />
                )}
            </Box>
        )
    }
}
