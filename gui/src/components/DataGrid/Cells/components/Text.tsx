import AbcIcon from "@mui/icons-material/Abc"
import { TextField, TextFieldProps } from "@mui/material"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useState } from "react"
import { Column } from "types"
import { Cell } from "../abstract/Cell"
import { ExposedInputProps } from "../abstract/protocols"

export class Text extends Cell {
    constructor(column: Column.Serialized) {
        super(column)
    }

    static brand = "string"
    public label = "Text"
    public icon = AbcIcon

    public ExposedInput: React.FC<ExposedInputProps<string | null, TextFieldProps>> = props => {
        const { updateRow } = useRow()
        const { snackError } = useSnacki()

        const [value, setValue] = useState(props.content)

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

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
                onChange={handleChange}
                onBlur={handleBlur}
                value={value}
                disabled={this.column.editable === false}
                {...props.InputProps}
                sx={props.InputStyle}
            />
        )
    }
}
