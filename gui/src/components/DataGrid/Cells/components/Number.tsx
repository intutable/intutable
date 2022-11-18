import LooksOneIcon from "@mui/icons-material/LooksOne"
import { TextField, TextFieldProps } from "@mui/material"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import React, { useState } from "react"
import { EditorProps } from "react-data-grid"
import { Row } from "types"
import { NumericCell } from "../abstract/NumericCell"
import { ExposedInputProps } from "../abstract/protocols"

export class Num extends NumericCell {
    readonly brand = "number"
    label = "Number"
    icon = LooksOneIcon

    editor = (props: EditorProps<Row>) => {
        const { row, key, content } = this.destruct(props)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
            props.onRowChange({
                ...row,
                [key]: e.target.value,
            })

        return <this.Input onChange={handleChange} type="number" onBlur={() => props.onClose(true)} value={content} />
    }

    public ExposedInput: React.FC<ExposedInputProps<number | null, TextFieldProps>> = props => {
        const { getRowId, updateRow } = useRow()
        const { snackError } = useSnacki()

        const [value, setValue] = useState(props.content ?? "")

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (this.isValid(e.target.value)) setValue(e.target.value)
        }

        const handleBlur = async () => {
            try {
                await updateRow(props.column, props.row, value)
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
                {...props.InputProps}
            />
        )
    }
}
