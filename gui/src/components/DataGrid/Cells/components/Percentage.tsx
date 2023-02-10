import { Box, InputAdornment, TextField } from "@mui/material"
import LinearProgress, { LinearProgressProps } from "@mui/material/LinearProgress"
import Typography from "@mui/material/Typography"
import React, { useState } from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"
import { NumericCell } from "../abstract/NumericCell"
import PercentIcon from "@mui/icons-material/Percent"
import { ExposedInputProps } from "../abstract/protocols"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { ExposedInputAdornment } from "@datagrid/RowMask/ExposedInputAdornment"
import { HelperTooltip } from "./Text"

const LinearProgressWithLabel = (props: LinearProgressProps & { value: number }) => (
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
    public brand = "percentage"
    public label = "Percentage"
    public icon = PercentIcon
    public canBeUserPrimaryKey = false

    static isValid(value: unknown): boolean {
        return typeof value === "number" && value >= 0 && value <= 100
    }

    static export(value: number): string {
        return value + "%"
    }
    static unexport(value: string): number {
        const unexported = Number(value.replace("%", "").trim())
        if (NumericCell.isNumeric(unexported) === false)
            throw new RangeError("Percentage Cell Debug Error: value is not a number")
        return unexported
    }

    public editor = (props: EditorProps<Row>) => {
        const { row, key, content } = this.destruct<number | null>(props)

        const [percentage, setPercentage] = React.useState<number | null>(content)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            let parsedValue: number | null

            // parse
            try {
                if (value === null || (typeof value === "string" && value === ""))
                    parsedValue = null // return null instead of an empty string
                else parsedValue = Number.parseInt(value)
            } catch (e) {
                return
            }

            // validate AND update
            if (parsedValue === null || Percentage.isValid(parsedValue)) {
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

    public formatter = (props: FormatterProps<Row>) => {
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
                {Percentage.isValid(content) && <LinearProgressWithLabel value={content!} />}
            </Box>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<number | null>> = props => {
        const { updateRow } = useRow()
        const { snackError } = useSnacki()

        const [percentage, setValue] = useState(props.content)
        const isEmpty = percentage == null || (percentage as unknown) === ""

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            let parsedValue: number | null

            // parse
            try {
                if (value === null || (typeof value === "string" && value === "")) parsedValue = null
                // return null instead of an empty string
                else parsedValue = Number.parseInt(value)
            } catch (e) {
                return
            }

            // validate
            if (parsedValue === null || Percentage.isValid(parsedValue)) setValue(parsedValue)
        }

        const handleBlur = async () => {
            try {
                await updateRow(props.column, props.row, percentage)
            } catch (e) {
                snackError("Der Wert konnte nicht geändert werden")
            }
        }

        return (
            <TextField
                size="small"
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        e.preventDefault()
                        handleBlur()
                    }
                }}
                fullWidth
                value={percentage ?? ""}
                disabled={this.column.editable === false}
                label={props.label}
                required={props.required}
                InputProps={{
                    readOnly: this.isReadonlyComponent,
                    endAdornment: (
                        <>
                            <InputAdornment position="end">%</InputAdornment>
                            <HelperTooltip text={props.tooltip} />
                        </>
                    ),
                    startAdornment: <ExposedInputAdornment column={this.column} />,
                }}
                placeholder={props.label == null && props.required ? props.placeholder + "*" : props.placeholder}
                error={props.required && isEmpty}
                helperText={props.required && isEmpty ? "Pflichtfeld" : undefined}
                sx={props.forwardSX}
                {...props.forwardProps}
            />
        )
    }
}
