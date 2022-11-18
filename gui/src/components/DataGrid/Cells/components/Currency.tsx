import { Box, InputAdornment, TextField } from "@mui/material"
import React, { useState } from "react"
import { EditorProps, FormatterProps } from "react-data-grid"
import { Row } from "types"
import { NumericCell } from "../abstract/NumericCell"
import PaidIcon from "@mui/icons-material/Paid"
import { ExposedInputProps } from "../abstract/protocols"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"

export class Currency extends NumericCell {
    readonly brand = "currency"
    label = "Currency"
    icon = PaidIcon

    export(value: number): string {
        return value + "€"
    }
    unexport(value: string): number {
        const unexported = Number(value.replace("€", "").trim())
        if (NumericCell.isNumeric(unexported) === false)
            throw new RangeError("Currency Cell Debug Error: value is not a number")
        return unexported
    }

    editor = (props: EditorProps<Row>) => {
        const { row, key, content } = this.destruct(props)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
            props.onRowChange({
                ...row,
                [key]: e.target.value,
            })

        return <this.Input onChange={handleChange} type="number" onBlur={() => props.onClose(true)} value={content} />
    }

    formatter = (props: FormatterProps<Row>) => {
        const { content } = this.destruct(props)

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
                <>
                    {content}
                    {content && " €"}
                </>
            </Box>
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<number | null>> = props => {
        const { getRowId, updateRow } = useRow()
        const { snackError } = useSnacki()

        const [value, setValue] = useState(props.content)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (this.isValid(e.target.value)) setValue(Number.parseInt(e.target.value))
        }

        const handleBlur = async () => {
            try {
                await updateRow(props.column, getRowId(props.row), value)
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
                value={value}
                InputProps={{
                    endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
            />
        )
    }
}
