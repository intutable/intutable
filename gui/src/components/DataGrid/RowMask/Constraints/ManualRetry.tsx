import RetryIcon from "@mui/icons-material/Replay"
import { IconButton, Tooltip } from "@mui/material"

export const ManualRetry: React.FC = props => {
    return (
        <Tooltip title="Erneut validieren.">
            <IconButton>
                <RetryIcon />
            </IconButton>
        </Tooltip>
    )
}
