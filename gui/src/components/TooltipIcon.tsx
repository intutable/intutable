import HelpIcon from "@mui/icons-material/Help"
import { IconButton, Tooltip } from "@mui/material"
import React from "react"

export type TooltipIconProps = {
    tooltip: string
}

export const TooltipIcon: React.FC<TooltipIconProps> = props => (
    <Tooltip title={props.tooltip} arrow enterDelay={1000} placement="right">
        <IconButton
            size="small"
            sx={{
                mt: 2,
                ml: 0.5,
            }}
        >
            <HelpIcon
                sx={{
                    cursor: "pointer",
                    fontSize: "85%",
                }}
            />
        </IconButton>
    </Tooltip>
)
