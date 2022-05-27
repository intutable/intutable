import React from "react"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import { Button } from "@mui/material"

export type ViewsProps = {
    handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void
    open: boolean
}

export const Views: React.FC<ViewsProps> = props => {
    return (
        <Button
            startIcon={props.open ? <VisibilityIcon /> : <VisibilityOffIcon />}
            onClick={props.handleClick}
        >
            Views
        </Button>
    )
}
