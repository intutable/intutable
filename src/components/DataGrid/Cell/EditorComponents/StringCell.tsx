import React, { useState } from "react"
import type { Editor } from "."
import { Input } from "./CustomInputField"

/**
 * {@link https://github.com/adazzle/react-data-grid/blob/main/src/editors/TextEditor.tsx}
 */

export const StringEditor: Editor = props => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onRowChange({
            ...row,
            [key]: e.target.value,
        })
    }

    const row = props.row
    const key = props.column.key
    const content = row[key] as string | number | boolean

    return (
        <Input
            onChange={handleChange}
            onBlur={() => props.onClose(true)}
            value={content.toString()}
        />
    )
}
