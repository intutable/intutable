import { Box, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Mismatch } from "@shared/constraints/util/Mismatch"

export const DebugMismatch: React.FC<{ mismatch: Mismatch }> = ({ mismatch }) => {
    const theme = useTheme()
    return (
        <Box
            sx={{
                borderRadius: theme.shape.borderRadius,
                bgcolor: theme.palette.error.main,
                py: 0.8,
                px: 1.5,
                mb: 0.5,
                overflowWrap: "break-word",
                width: 1,
            }}
        >
            <Typography>{mismatch.title}</Typography>
            {mismatch.severity}
            <Typography variant="body2" fontSize="small">
                {mismatch.message}
            </Typography>
            {mismatch.howToSolve}
        </Box>
    )
}
