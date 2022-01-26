import React from "react"
import type { CellComponent } from "./types"
import { EditableTextCell } from "./EditableTextCell"

export const StringCell: CellComponent = props => {
    const handleChange = (value: string) => {
        alert(`Neuer Wert: ${value}`)
    }

    const content = props.editorProps.row[
        props.editorProps.column.key
    ] as string

    return (
        <EditableTextCell onChange={newValue => handleChange(newValue)}>
            {content}
        </EditableTextCell>
    )
}
