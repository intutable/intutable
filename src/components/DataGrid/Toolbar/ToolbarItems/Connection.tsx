import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import { Box, useTheme } from "@mui/material"
import type { PredefinedToolbarItem } from "../types"

export type ConnectionStatus = "connected" | "disconnected"

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
                ...(props.status === "connected" ? { color: "#4caf50" } : { color: "#d9182e" }),
            }}
        />
        {props.status}
    </Box>
)

export default Connection
