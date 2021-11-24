import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import { Box, useTheme } from "@mui/material"
import type { PredefinedToolbarItem } from "../types"

const getColorForConnectionStatus = (status: ConnectionStatus) => {
    const theme = useTheme()
    switch (status) {
        case "connected":
            return theme.palette.success.light
        case "disconnected":
            return theme.palette.error.light
        case "connecting":
            return theme.palette.warning.light
        case "busy":
            return theme.palette.warning.light
        default:
            return theme.palette.text.secondary
    }
}

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "busy"

type ConnectionProps = {
    status: ConnectionStatus
}
/**
 * Toolbar item for connection status.
 */
const Connection: PredefinedToolbarItem<ConnectionProps> = props => (
    <Box sx={{ display: "flex", padding: 2 }}>
        <FiberManualRecordIcon
            fontSize="small"
            sx={{
                mr: 1,
                color: getColorForConnectionStatus(props.status),
            }}
        />
        {props.status}
    </Box>
)

export default Connection
