import React, { useEffect, useState, useMemo } from "react"
import { Input } from "./CustomInputField"

type EditableCellProps = {
    /**
     * value of the cell
     */
    children: string
    /**
     * called when the value of the cell is changed
     */
    onChange: (newValue: string) => void
    /**
     * @default false
     */
    readonly?: boolean
}

export const EditableTextCell: React.FC<EditableCellProps> = props => {
    const [value, setValue] = useState<string>(props.children)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value.trim())
    }

    // TODO: https://github.com/adazzle/react-data-grid/blob/0074e4107f91d5dff48b4ba43864cf0718ac1282/src/editors/TextEditor.tsx#L37
    const handleUpdate = () => {
        if (value !== props.children) {
            props.onChange(value)
        }
    }

    const handleKeypress = (e: any) => {
        if (e.key == "Enter") {
            handleUpdate()
        }
    }

    // TODO: not working
    // useEffect(() => {
    //     if (document) document.addEventListener("keyup", handleKeypress)
    //     return () => {
    //         if (document) document.removeEventListener("keyup", handleKeypress)
    //     }
    // }, [])

    return (
        <Input
            onChange={handleChange}
            onBlur={handleUpdate}
            value={value}
            disabled={props.readonly ?? false}
        />
    )
}
