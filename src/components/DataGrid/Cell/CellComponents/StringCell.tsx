import React from "react"
import type { CellComponent } from "./types"
import { EditableTextCell } from "./EditableTextCell"

export const StringCell: CellComponent = props => {
    const handleChange = (value: string) => {
        alert(`Neuer Wert: ${value}`)
    }

    return (
        <EditableTextCell onChange={newValue => handleChange(newValue)}>
            {props.editorProps.row[props.editorProps.column.key]}
        </EditableTextCell>
    )
}
