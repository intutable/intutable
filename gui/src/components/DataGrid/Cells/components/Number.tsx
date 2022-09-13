import React from "react"
import { EditorProps } from "react-data-grid"
import { Row } from "types"
import Cell from "../Cell"

export class Num extends Cell {
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

    isValid(value: unknown): boolean {
        return typeof value === "number"
    }
}
