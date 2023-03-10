import {
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Fade,
    IconButton,
    Stack,
    Typography,
} from "@mui/material"
import { useConstraintValidation } from "context/ConstraintValidationContext"
import { useTheme } from "@mui/material/styles"
import CloseIcon from "@mui/icons-material/Close"
import { Beta } from "components/Beta"
import { ProgressIndicator } from "./ProgressIndicator"
import { DebugMismatch } from "./DebugMismatch"
import { useUserSettings } from "hooks/useUserSettings"
import WarningIcon from "@mui/icons-material/Warning"
import { useInputMask } from "hooks/useInputMask"
import { ManualRetry } from "./ManualRetry"
import { useState } from "react"

const formatTime = (timeInMs: number) => {}

export type ConstraintSectionProps = {
    onClose: () => void
}

export const ConstraintSection: React.FC<ConstraintSectionProps> = props => {
    const { state, loading } = useConstraintValidation()
    const { userSettings, changeUserSetting } = useUserSettings()
    const { currentInputMask } = useInputMask()
    const theme = useTheme()

    const [verboseLogCollapsed, setVerboseLogCollapsed] = useState<boolean>(true)

    return (
        <Box
            sx={{
                minWidth: "300px",
                boxSizing: "border-box",
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

            {userSettings?.constraintValidation === "never" ? (
                <Stack direction="row" marginY={5} justifyContent="center">
                    <Typography
                        textAlign={"center"}
                        variant="overline"
                        fontSize="large"
                        sx={{ color: theme.palette.error.main }}
                    >
                        Ausgeschaltet
                    </Typography>
                </Stack>
            ) : (
                <>
                    <Box marginTop={5}>
                        <ProgressIndicator />
                    </Box>

                    {state.runtimeErrors.length > 0 && (
                        <Box marginTop={5}>
                            <Divider>
                                <Typography color="error" variant="overline">
                                    Systemfehlerbericht
                                </Typography>
                            </Divider>
                            <Typography variant="body2" color="text.secondary">
                                Während der Validierung ist ein System-Fehler aufgetreten.
                            </Typography>
                            <ManualRetry />
                        </Box>
                    )}

                    {state.finished && (
                        <Box marginTop={5}>
                            <Divider>
                                <Typography variant="overline">Ergebnissbericht</Typography>
                            </Divider>
                            <ul>
                                <li>
                                    Validiert: {state.progress[0]}/{state.progress[1]}
                                    <ul>
                                        <li>Zeit: {state.report!.time} ms</li>
                                        <li>Erfolgreich: {state.report!.succeeded.length}</li>
                                        <li>Fehlgeschlagen: {state.report!.failed.length}</li>
                                        <li>Unterbrochen: {state.report!.interrupted.length}</li>
                                    </ul>
                                </li>
                                <li>Ausgeführt: 0/0 (Nicht implementiert)</li>
                            </ul>
                            {/* <Typography
                                onClick={() => setVerboseLogCollapsed(prev => !prev)}
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontStyle: "italic",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                }}
                            >
                                {verboseLogCollapsed ? "mehr anzeigen" : "weniger anzeigen"}
                            </Typography>
                            {verboseLogCollapsed === false && <Box>{state.}</Box>} */}
                        </Box>
                    )}

                    {state.finished && state.report!.mismatches.length > 0 && (
                        <Box marginTop={10}>
                            <Divider>
                                <Badge
                                    badgeContent={state.report!.mismatches.length}
                                    color="warning"
                                >
                                    <Typography color="warning" variant="overline">
                                        Mismatches
                                    </Typography>
                                </Badge>
                            </Divider>

                            <Stack direction="column">
                                {state.report!.mismatches.map((mismatch, i) => (
                                    <DebugMismatch key={mismatch.title + i} mismatch={mismatch} />
                                ))}
                            </Stack>
                        </Box>
                    )}
                </>
            )}
        </Box>
    )
}
