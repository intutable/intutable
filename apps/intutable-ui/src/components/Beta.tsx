import { Chip, Tooltip } from "@mui/material"

export const Beta: React.FC = () => {
    return (
        <Tooltip
            title="Dieses Feature befindet sich in einer Beta. Bitte bedenken Sie, dass unerwartete Fehler auftreten können oder sich einige Funktionen unerwartet verhalten."
            arrow
            placement="top"
            color="warning"
        >
            <Chip
                variant="outlined"
                label="BETA"
                color="warning"
                size="small"
                sx={{ cursor: "help" }}
            />
        </Tooltip>
    )
}
