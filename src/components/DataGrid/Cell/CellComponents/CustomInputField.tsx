import React from "react"
import { useTheme, styled } from "@mui/material"
import { InputUnstyled, useInput, UseInputProps } from "@mui/base"

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

type InputProps = {
    props: UseInputProps
    ref: React.Ref<HTMLInputElement> | undefined
}

export const Input = React.forwardRef(
    (props: UseInputProps, ref: React.Ref<HTMLInputElement> | undefined) => (
        <InputUnstyled
            components={{ Input: StyledInputElement }}
            {...props}
            ref={ref}
        />
    )
)
