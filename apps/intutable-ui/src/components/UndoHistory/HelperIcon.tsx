import InfoIcon from "@mui/icons-material/Info"
import { Tooltip } from "@mui/material"

export const HelperIcon: React.FC<{ title: string }> = ({ title }) => (
    <Tooltip title={title} arrow placement="right">
        <InfoIcon color="disabled" sx={{ cursor: "help", fontSize: "80%" }} />
    </Tooltip>
)
