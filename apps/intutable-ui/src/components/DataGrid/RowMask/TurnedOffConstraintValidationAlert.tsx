import { Alert, AlertTitle, Box, Button, Collapse, IconButton } from "@mui/material"
import { useRowMask } from "context/RowMaskContext"
import React from "react"
import CloseIcon from "@mui/icons-material/Close"
import Link from "components/Link"
import { useUserSettings } from "hooks/useUserSettings"

export const TurnedOffConstraintValidationAlert: React.FC = () => {
    const { inputMask } = useRowMask()
    const { userSettings, changeUserSetting } = useUserSettings()

    const acknowledgeWarning = () => {
        changeUserSetting({
            acknowledgedConstraintDangers: true,
        })
    }

    if (
        !inputMask ||
        userSettings?.constraintValidation !== "never" ||
        userSettings.acknowledgedConstraintDangers
    )
        return null

    return (
        <Collapse in>
            <Box sx={{ px: 5, my: 3 }}>
                <Alert
                    severity="error"
                    variant="filled"
                    action={
                        <IconButton onClick={acknowledgeWarning} size="small">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    <AlertTitle>Achtung! Ihre Constraint-Validierung ist ausgeschaltet.</AlertTitle>
                    Schalten Sie diese nur aus, wenn Sie sich sicher sind. Unerwartete Fehler können
                    auftreten! Unter{" "}
                    <Link href="/settings">Einstellungen &#8250; Eingabemasken</Link> können Sie die
                    Constraint-Validierung wieder einschalten.
                </Alert>
            </Box>
        </Collapse>
    )
}
