import { Box, CircularProgress, CircularProgressProps, Typography, Zoom } from "@mui/material"
import ErrorIcon from "@mui/icons-material/Error"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"

export function CircularProgressWithLabel(
    props: CircularProgressProps & { steps: [number, number]; success: boolean | null }
) {
    const { success, steps } = props
    return (
        <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
                variant="determinate"
                color={success == null ? "warning" : success === false ? "error" : "success"}
                {...props}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {success === false && steps[0] === steps[1] ? (
                    <Zoom in>
                        <ErrorIcon fontSize="small" color="error" />
                    </Zoom>
                ) : success === true ? (
                    <Zoom in>
                        <ThumbUpIcon fontSize="small" color="success" />
                    </Zoom>
                ) : (
                    <Typography variant="caption" component="div" color="text.secondary">
                        {steps[0]}/{steps[1]}
                    </Typography>
                )}
            </Box>
        </Box>
    )
}
