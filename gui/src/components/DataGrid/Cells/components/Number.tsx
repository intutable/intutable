import { TextField } from "@mui/material"
import { useRow } from "hooks/useRow"
import React, { useState } from "react"
import { EditorProps } from "react-data-grid"
import { Row } from "types"
import { ExposedInputProps } from "../abstract/Cell"
import { NumericCell } from "../abstract/NumericCell"
import LooksOneIcon from "@mui/icons-material/LooksOne"

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

        return (
            <this.Input
                onChange={handleChange}
                type="number"
                onBlur={() => props.onClose(true)}
                value={content}
            />
        )
    }

    public ExposedInput = (props: ExposedInputProps) => {
        const { getRowId, updateRow } = useRow()

        const [content, setContent] = useState(props.content ?? "")

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setContent(e.target.value)
            if (props.update.mode === "alien")
                props.update.onChange(e.target.value)
        }

        const handleBlur = async () => {
            if (props.update.mode === "self") {
                const { row, column } = props.update
                await updateRow(column, getRowId(row), content)
            }
        }

        return (
            <TextField
                size="small"
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
                value={content}
            />
        )
    }
}
