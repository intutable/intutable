import RuleIcon from "@mui/icons-material/Rule"
import SyncIcon from "@mui/icons-material/Sync"
import SyncDisabledIcon from "@mui/icons-material/SyncDisabled"
import SyncProblemIcon from "@mui/icons-material/SyncProblem"
import VerifiedIcon from "@mui/icons-material/Verified"

import { Badge, Grow, IconButton, Tooltip, Zoom } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useConstraints } from "context/ConstraintsContext"

export type ConstraintsValidProps = {
    onShowInvalidConstraints: () => void
}

export const ConstraintsValid: React.FC<ConstraintsValidProps> = props => {
    const theme = useTheme()

    const { isValid, isSynchronising, loaded, error, constraintMismatches } = useConstraints()

    // if an error occured, always display it first
    if (error != null)
        return (
            <Tooltip
                arrow
                placement="right"
                title="Anscheinend ist ein Fehler aufgetreten 😕"
                TransitionComponent={Zoom}
            >
                <IconButton color="error">
                    <SyncProblemIcon />
                </IconButton>
            </Tooltip>
        )

    // if constraints are note loaded yet
    if (loaded === false)
        return (
            <Tooltip
                arrow
                placement="right"
                title="Keine Sorge, es geht gleich los. Ich muss noch ein paar Daten laden 😆"
                TransitionComponent={Zoom}
            >
                <IconButton color="warning">
                    <SyncDisabledIcon />
                </IconButton>
            </Tooltip>
        )

    if (isSynchronising)
        return (
            <>
                <Tooltip
                    arrow
                    placement="right"
                    title="Ich überprüfe schnell deine Änderungen, damit alles mit rechten Dingen zugeht 🤓"
                    TransitionComponent={Zoom}
                >
                    <IconButton color="info">
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

    if (isValid === false)
        return (
            <Tooltip
                arrow
                placement="right"
                title="Oh, Mist! 😤 Einige deiner Eingaben kann ich nicht übernehmen, da sie Regeln verletzen 😬 (Klick auf mich für mehr.)"
                TransitionComponent={Zoom}
            >
                <IconButton color="error" onClick={props.onShowInvalidConstraints}>
                    <Badge badgeContent={constraintMismatches.length} color="error">
                        <RuleIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
        )

    if (isValid)
        return (
            <Tooltip
                arrow
                placement="right"
                title={"Juhu! 🥳 Ich habe keine Fehler entdeckt."}
                TransitionComponent={Zoom}
            >
                <Grow in>
                    <IconButton color="success">
                        <VerifiedIcon />
                    </IconButton>
                </Grow>
            </Tooltip>
        )

    return null
}
