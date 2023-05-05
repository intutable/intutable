import { ExposedInputAdornment } from "@datagrid/RowMask/ExposedInputAdornment"
import AbcIcon from "@mui/icons-material/Abc"
import { TextField, TextFieldProps, Tooltip } from "@mui/material"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useEffect, useState } from "react"
import { Column } from "types"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"
import InfoIcon from "@mui/icons-material/Info"

export const HelperTooltip: React.FC<{ text?: string }> = props =>
    props.text == null ? null : (
        <Tooltip title={props.text} arrow placement="right">
            <InfoIcon
                sx={{
                    fontSize: "80%",
                }}
                color="disabled"
            />
        </Tooltip>
    )

export class Text extends Cell {
    constructor(column: Column.Serialized) {
        super(column)
    }

    public brand = "string"
    public label = "Text"
    public icon = AbcIcon

    public ExposedInput: React.FC<ExposedInputProps<string | null, TextFieldProps>> = props => {
        const { updateRow } = useRow()
        const { snackError } = useSnacki()

        const [value, setValue] = useState(props.content ?? "")
        const isEmpty = value == null || value === ""

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

        // make sure null is the same as ""
        const hasChanged = (): boolean =>
            props.content == null && value === "" ? false : value !== props.content

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
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={e => {
                    if (e.key === "Enter" && hasChanged()) {
                        e.preventDefault()
                        handleBlur()
                    }
                }}
                autoFocus={this.column.isUserPrimaryKey}
                id={"row-mask-field-" + this.column.id}
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
