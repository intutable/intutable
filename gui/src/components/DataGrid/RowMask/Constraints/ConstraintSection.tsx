import { Badge, Box, Divider, Fade, IconButton, Stack, Typography } from "@mui/material"
import { useConstraintValidation } from "context/ConstraintContext"
import { useTheme } from "@mui/material/styles"
import CloseIcon from "@mui/icons-material/Close"
import { Beta } from "components/Beta"
import { CircularProgressWithLabel } from "./CircularProgressWithLabel"
import { DebugMismatch } from "./DebugMismatch"

export type ConstraintSectionProps = {
    onClose: () => void
}

export const ConstraintSection: React.FC<ConstraintSectionProps> = props => {
    const { steps, debugMessages, succeeded, isValidationRunning } = useConstraintValidation()

    const progress = (steps[0] / steps[1]) * 100

    return (
        <Box
            sx={{
                minWidth: "300px",
                height: 1,
                boxSizing: "border-box",
                overflowY: "scroll",
            }}
        >
            <Stack direction="row" alignItems={"center"} gap={1} marginBottom={3}>
                <Beta />
                <Typography variant="overline">Constraints</Typography>
                <Box flexGrow={1} />
                <IconButton onClick={props.onClose} size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Stack>

            <span>Status: </span>

            <span>Zyklus: </span>

            <span>Validiert: x/y</span>
            <Fade in>
                <Box>
                    <CircularProgressWithLabel value={progress} steps={steps} success={succeeded} />
                </Box>
            </Fade>

            <Badge badgeContent={1} color="error">
                <Typography color="error">Warnungen:</Typography>
            </Badge>

            <Stack direction="column">
                {debugMessages.map((mismatch, i) => (
                    <DebugMismatch key={mismatch.title + i} mismatch={mismatch} />
                ))}
            </Stack>
        </Box>
    )
}
