import { Alert } from "@mui/material"
import Link from "components/Link"
import { useUserSettings } from "hooks/useUserSettings"

export const IncompleteUserSettingsWarning: React.FC = () => {
    const { userSettings } = useUserSettings()

    const incomplete =
        userSettings?.firstName === "" || userSettings?.lastName === "" || userSettings?.sex === ""

    if (!incomplete) return null

    return (
        <Alert severity="warning" sx={{ mb: 6 }}>
            Sie haben noch nicht alle persönlichen Daten angegeben. Bitte vervollständigen Sie diese
            unter <Link href="/settings">Einstellungen &#8250; Benutzerkonto</Link>.
        </Alert>
    )
}
