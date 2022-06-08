import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import { IconButton, Tooltip } from "@mui/material"
import React from "react"

export type ViewsProps = {
    handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void
    open: boolean
}

export const Views: React.FC<ViewsProps> = props => {
    return (
        <Tooltip
            arrow
            title={`Views-Editor ${props.open ? "schließen" : "öffnen"}`}
            enterDelay={1000}
        >
            <IconButton onClick={props.handleClick}>
                {props.open ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
        </Tooltip>
    )
}
