import React from "react"

type EditableCellProps = {
    children: React.ReactNode
    /**
     * @default false
     */
    readonly?: boolean
}

export const EditableCell: React.FC<EditableCellProps> = props => props.children
