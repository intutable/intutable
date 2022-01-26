import React from "react"
import type { CellComponent } from "./types"
import { EditableTextCell } from "./EditableTextCell"

export const StringCell: CellComponent = props => {
    const handleChange = (value: string) => {
        alert(`Neuer Wert: ${value}`)
    }

    const row = props.editorProps.row
    const key = props.editorProps.column.key
    const content = row[key] as string | number | boolean

    return (
        <EditableTextCell onChange={newValue => handleChange(newValue)}>
            {content.toString()}
        </EditableTextCell>
    )
}
