import React, { useEffect, useState } from "react"
import { Row } from "types"
import { isValidMailAddress } from "utils/isValidMailAddress"
import { EditorComponent } from "../../types/EditorComponent"
import { Input } from "./Input"
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail"
import { Box, Stack, TextField } from "@mui/material"

/**
 * // TODO: click outside works
 * hitting enter not
 */

export const EMailEditor: EditorComponent = props => {
    const row = props.row
    const key = props.column.key as keyof Row
    const content = row[key]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.onRowChange({
            ...row,
            [key]: e.target.value,
        })
    }

    const onSave = () => props.onClose(true)

    return <Input onChange={handleChange} onBlur={onSave} value={content} />
}
