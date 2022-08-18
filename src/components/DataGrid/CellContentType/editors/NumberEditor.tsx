import { EditorComponent } from "../../types/EditorComponent"
import React from "react"
import { Row } from "types"
import { Input } from "../inputs/Input"

export const NumberEditor: EditorComponent = props => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onRowChange({
            ...row,
            [key]: e.target.value,
        })
    }

    const row = props.row
    const key = props.column.key as keyof Row
    const content = row[key]

    return (
        <Input
            onChange={handleChange}
            type="number"
            onBlur={() => props.onClose(true)}
            value={content}
        />
    )
}
export default NumberEditor
