import React from "react"
import { useTheme, styled } from "@mui/material"
import { InputUnstyled, useInput, UseInputProps } from "@mui/base"

const StyledInputElement = styled("input")`
    width: 200px;
    font-size: 1rem;
    font-family: IBM Plex Sans, sans-serif;
    font-weight: 400;
    line-height: 1.4375em;
    background: rgb(243, 246, 249);
    border: 1px solid #e5e8ec;
    border-radius: 10px;
    padding: 6px 10px;
    color: #20262d;
    transition: width 300ms ease;

    &:hover {
        background: #eaeef3;
        border-color: #e5e8ec;
    }

    &:focus {
        outline: none;
        width: 220px;
        transition: width 200ms ease-out;
    }
`

const Input = React.forwardRef(
    (props: UseInputProps, ref: React.Ref<HTMLInputElement> | undefined) => {
        const { getRootProps, getInputProps } = useInput(props, ref)

        return (
            <div {...getRootProps()}>
                <StyledInputElement {...props} {...getInputProps()} />
            </div>
        )
    }
)

type EditableCellProps = {
    // children: React.ReactNode
    // onChange: (value: string) => void
    /**
     * @default false
     */
    readonly?: boolean
}

export const EditableTextCell: React.FC<EditableCellProps> = props => {
    return <Input />
}
