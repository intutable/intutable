import { TextField } from "@mui/material"
import { useRow } from "hooks/useRow"
import React, { useState } from "react"
import { EditorProps } from "react-data-grid"
import { Row } from "types"
import {
    ExposedInputProps,
    ExposedInputUpdateCallback,
    ExposedInputUpdateHandler,
} from "../abstract/Cell"
import { NumericCell } from "../abstract/NumericCell"

export class Num extends NumericCell {
    readonly brand = "number"
    label = "Number"

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
            if (this.updateHandlerIsCallback(props.updateHandler)) {
                const callback = (
                    props.updateHandler as ExposedInputUpdateCallback
                ).onChange
                callback(e.target.value)
            }
        }

        const handleBlur = async () => {
            if (this.updateHandlerIsCallback(props.updateHandler) === false) {
                const { row, column } =
                    props.updateHandler as ExposedInputUpdateHandler
                await updateRow(column, getRowId(row), content)
            }
        }

        return (
            <TextField
                type="number"
                onChange={handleChange}
                onBlur={handleBlur}
                value={content}
            />
        )
    }
}
