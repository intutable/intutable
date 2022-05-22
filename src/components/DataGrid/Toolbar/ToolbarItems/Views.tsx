import React from "react"
import VisibilityIcon from "@mui/icons-material/Visibility"
import { Button } from "@mui/material"

export type ViewsProps = {
    handleClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const Views: React.FC<ViewsProps> = props => {
    return (
        <Button startIcon={<VisibilityIcon />} onClick={props.handleClick}>
            Views
        </Button>
    )
}
