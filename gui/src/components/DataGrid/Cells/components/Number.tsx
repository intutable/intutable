import React from "react"
import { EditorProps } from "react-data-grid"
import { Row } from "types"
import { NumericCell, NumericSerializedCell } from "../abstract/NumericCell"

class NumSerialized extends NumericSerializedCell {
    readonly brand = "number"
    label = "Number"    
}
export class Num extends NumericCell {
    serializedCellDelegate = new NumSerialized()

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
}
