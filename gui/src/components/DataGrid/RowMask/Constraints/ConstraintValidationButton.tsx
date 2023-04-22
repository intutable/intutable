import RuleIcon from "@mui/icons-material/Rule"
import SyncIcon from "@mui/icons-material/Sync"
import SyncDisabledIcon from "@mui/icons-material/SyncDisabled"
import SyncProblemIcon from "@mui/icons-material/SyncProblem"
import VerifiedIcon from "@mui/icons-material/Verified"
import { LoadingButton } from "@mui/lab"
import { Badge, Button, Grow, IconButton, Tooltip, Zoom } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useConstraintValidation } from "context/ConstraintValidationContext"
import { useInputMask } from "hooks/useInputMask"
import { useUserSettings } from "hooks/useUserSettings"
import ReValidateIcon from "@mui/icons-material/Replay"

export const ConstraintValidationButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
    const theme = useTheme()
    const { currentInputMask } = useInputMask()
    const { state, loading, validate } = useConstraintValidation()
    const { userSettings } = useUserSettings()

    if (currentInputMask == null) return null

    // if an error occured, always display it first
    if (state.runtimeErrors.length > 0)
        return (
            <Tooltip
                arrow
                placement="right"
                title="Ein Systemfehler ist aufgetreten. Ich konnte die Validierung nicht beenden 😕"
                TransitionComponent={Zoom}
            >
                <IconButton color="error" onClick={onClick}>
                    <SyncProblemIcon />
                </IconButton>
            </Tooltip>
        )

    // if constraints are note loaded yet
    if (loading)
        return (
            <Tooltip
                arrow
                placement="right"
                title="Keine Sorge, es geht gleich los. Ich muss noch ein paar Daten laden 😆"
                TransitionComponent={Zoom}
            >
                <IconButton color="warning" onClick={onClick}>
                    <SyncDisabledIcon />
                </IconButton>
            </Tooltip>
        )

    if (state.isRunning)
        return (
            <>
                <Tooltip
                    arrow
                    placement="right"
                    title="Ich überprüfe schnell deine Änderungen, damit alles mit rechten Dingen zugeht 🤓"
                    TransitionComponent={Zoom}
                >
                    <IconButton color="info" onClick={onClick}>
                        <SyncIcon
                            sx={{
                                animation: "spin 3s linear infinite",
                            }}
                        />
                    </IconButton>
                </Tooltip>
                <style>{`
            @keyframes spin {
                0% { transform: rotate(360deg); }
                100% { transform: rotate(0deg); }
            }
            `}</style>
            </>
        )

    if (
        state.finished &&
        (state.report!.failed.length > 0 ||
            state.report!.interrupted.length > 0 ||
            state.report!.log.length > 0)
    )
        return (
            <Tooltip
                arrow
                placement="right"
                title="Oh, Mist! 😤 Einige deiner Eingaben kann ich nicht übernehmen, da sie Regeln verletzen 😬"
                TransitionComponent={Zoom}
            >
                <IconButton color="error" onClick={onClick}>
                    <Badge
                        badgeContent={
                            state.report!.failed.length + state.report!.interrupted.length
                        }
                        color="error"
                    >
                        <RuleIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
        )

    if (state.finished && state.report!.succeeded.length === state.progress[1])
        return (
            <Tooltip
                arrow
                placement="right"
                title={"Juhu! 🥳 Ich habe keine Fehler entdeckt."}
                TransitionComponent={Zoom}
            >
                <Grow in>
                    <IconButton color="success" onClick={onClick}>
                        <VerifiedIcon />
                    </IconButton>
                </Grow>
            </Tooltip>
        )

    if (
        userSettings?.constraintValidation === "opening-closening" &&
        state.finished === false &&
        state.isRunning === false
    )
        return (
            <Button
                size="small"
                startIcon={<ReValidateIcon fontSize="small" />}
                variant="outlined"
                color="success"
                disabled={state.isRunning}
                onClick={() => {
                    if (onClick) onClick()

                    validate()
                }}
            >
                Validieren
            </Button>
        )

    return null
}
