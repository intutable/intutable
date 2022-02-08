import { Row } from "@app/types/types"
import React, { useState } from "react"
import type { Editor } from "."
import { Input } from "./Input"

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
    const key = props.column.key as keyof Row
    const content = row[key]

    return (
        <Input
            onChange={handleChange}
            onBlur={() => props.onClose(true)}
            value={content}
        />
    )
}
