import { InputUnstyled, UseInputProps } from "@mui/base"
import { styled } from "@mui/material"
import React from "react"

const StyledInputElement = styled("input")`
    width: 100%;
    font-size: 1rem;
    font-family: IBM Plex Sans, sans-serif;
    font-weight: 400;
    line-height: 1.4375em;
    background: transparent;
    padding: 6px 10px;
    color: #20262d;

    &:focus {
        outline: none;
    }
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InputProps = {
    props: UseInputProps & { onEnter?: () => void }
    ref: React.Ref<HTMLInputElement> | undefined
}

export const Input = React.forwardRef(
    (
        props: UseInputProps & {
            onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
        },
        ref: React.Ref<HTMLInputElement> | undefined
    ) => (
        <InputUnstyled
            components={{ Input: StyledInputElement }}
            {...props}
            ref={ref}
            onKeyDown={props.onKeyDown}
        />
    )
)
Input.displayName = "Input"

export default Input
