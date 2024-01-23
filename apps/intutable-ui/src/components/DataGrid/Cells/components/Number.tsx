import { ExposedInputAdornment } from "@datagrid/RowMask/ExposedInputAdornment"
import LooksOneIcon from "@mui/icons-material/LooksOne"
import { TextField, TextFieldProps } from "@mui/material"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import React, { useState } from "react"
import { EditorProps } from "react-data-grid"
import { Row } from "types"
import { NumericCell } from "../abstract/NumericCell"
import { ExposedInputProps } from "../abstract/protocols"
import { HelperTooltip } from "./Text"

export class Num extends NumericCell {
    public brand = "number"
    public label = "Number"
    public icon = LooksOneIcon

    public editor = (props: EditorProps<Row>) => {
        const { row, key, content } = this.destruct(props)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
            props.onRowChange({
                ...row,
                [key]: e.target.value,
            })

        return (
            <this.Input
                onChange={handleChange}
                type="number"
                onBlur={() => props.onClose(true)}
                value={content}
            />
        )
    }

    public ExposedInput: React.FC<ExposedInputProps<number | null, TextFieldProps>> = props => {
        const { updateRow } = useRow()
        const { snackError } = useSnacki()

        const [value, setValue] = useState(props.content ?? "")
        const isEmpty = value == null || value === ""

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (Num.isValid(e.target.value)) setValue(e.target.value)
        }

        const hasChanged = (): boolean => value !== props.content

        const handleBlur = async () => {
            try {
                if (hasChanged() === false) return
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
                autoFocus={this.column.isUserPrimaryKey}
                id={"row-mask-field-" + this.column.id}
                onKeyDown={e => {
                    if (e.key === "Enter" && hasChanged()) {
                        e.preventDefault()
                        handleBlur()
                    }
                }}
                fullWidth
                value={value}
                disabled={this.column.editable === false}
                label={props.label}
                required={props.required}
                InputProps={{
                    readOnly: this.isReadonlyComponent,
                    startAdornment: <ExposedInputAdornment column={this.column} />,
                    endAdornment: <HelperTooltip text={props.tooltip} />,
                }}
                placeholder={
                    props.label == null && props.required
                        ? props.placeholder + "*"
                        : props.placeholder
                }
                error={props.required && isEmpty}
                helperText={props.required && isEmpty ? "Pflichtfeld" : undefined}
                sx={props.forwardSX}
                {...props.forwardProps}
            />
        )
    }
}