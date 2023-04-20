import {
    Box,
    CircularProgress,
    CircularProgressProps,
    Fade,
    Stack,
    Typography,
    Zoom,
} from "@mui/material"
import ErrorIcon from "@mui/icons-material/Error"
import ThumbUpIcon from "@mui/icons-material/ThumbUp"
import { useConstraintValidation } from "context/ConstraintValidationContext"

export const ProgressIndicator: React.FC = () => {
    const { state, loading } = useConstraintValidation()

    /**
     * Either
     * • runtime errors
     * • failed constraints (mismatches)
     * • interrupted constraints
     */
    const failure =
        state.runtimeErrors.length > 0 ||
        (state.report &&
            (state.report.failed.length > 0 ||
                state.report.interrupted.length > 0 ||
                state.report.log.length > 0))
    /** When ALL constraints passed */
    const success = state.report && state.report.succeeded.length === state.progress[1]
    const internalState: "failure" | "success" | "running" | Error =
        state.isRunning || loading
            ? "running"
            : failure
            ? "failure"
            : success
            ? "success"
            : new Error("This should not happen")
    if (internalState instanceof Error) throw internalState

    const progress = (state.progress[0] / state.progress[1]) * 100

    return (
        <Stack direction="row" justifyContent="center" alignItems="center" gap={2}>
            <Fade in>
                <Box>
                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                        <CircularProgress
                            variant={internalState === "running" ? "indeterminate" : "determinate"}
                            color={
                                internalState === "running"
                                    ? "primary"
                                    : internalState === "failure"
                                    ? "error"
                                    : "success"
                            }
                            value={progress}
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
                            {internalState === "failure" &&
                            state.progress[0] === state.progress[1] ? (
                                <Zoom in>
                                    <ErrorIcon fontSize="small" color="error" />
                                </Zoom>
                            ) : internalState === "success" ? (
                                <Zoom in>
                                    <ThumbUpIcon fontSize="small" color="success" />
                                </Zoom>
                            ) : loading === false ? (
                                <Typography
                                    variant="caption"
                                    component="div"
                                    color="text.secondary"
                                >
                                    {state.progress[0]}/{state.progress[1]}
                                </Typography>
                            ) : null}
                        </Box>
                    </Box>
                </Box>
            </Fade>
            <Typography variant="caption" color="text.secondary">
                {loading
                    ? "Lade Constraints ..."
                    : state.finished
                    ? "Validierung abgeschlossen "
                    : state.isRunning
                    ? "Validiere Constraints ..."
                    : ""}
            </Typography>
        </Stack>
    )
}
