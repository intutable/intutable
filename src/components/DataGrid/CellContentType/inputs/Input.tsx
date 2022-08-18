import { InputUnstyled, InputUnstyledProps } from "@mui/base"
import { styled } from "@mui/material/styles"
import React from "react"

/**
 * @link https://mui.com/system/styled/
 */

/**
 *
 */
const StyledInputElement = styled("input")`
    width: 100%;
    font-size: 1rem;
    font-family: Roboto, sans-serif;
    font-weight: 400;
    line-height: 1.4375em;
    background: transparent;
    padding: 6px 10px;
    color: #20262d;

    &:focus {
        outline: none;
    }
`

export const Input = React.forwardRef(
    (
        props: InputUnstyledProps & {
            onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
        },
        ref?: React.Ref<HTMLInputElement>
    ) => (
        <InputUnstyled
            components={{ Input: StyledInputElement }}
            ref={ref || props.ref}
            onKeyDown={props.onKeyDown}
            {...props}
        />
    )
)
Input.displayName = "Input"

export default Input
