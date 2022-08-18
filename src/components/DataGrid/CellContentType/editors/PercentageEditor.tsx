import { EditorComponent } from "../../types/EditorComponent"
import React from "react"
import { Row } from "types"
import { Input } from "../inputs/Input"

export const PercentageEditor: EditorComponent = props => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        if (isValid(value as unknown as number) === false) return

        props.onRowChange({
            ...row,
            [key]: value,
        })
    }

    const row = props.row
    const key = props.column.key as keyof Row
    const content = row[key]

    const isValid = (value: number): boolean => {
        if (value < 0 || value > 100) return false

        return true
    }

    return (
        <Input
            onChange={handleChange}
            type="number"
            onBlur={() => props.onClose(true)}
            value={content}
        />
    )
}
export default PercentageEditor
