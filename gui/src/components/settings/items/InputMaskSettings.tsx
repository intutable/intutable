import {
    CircularProgress,
    ListItem,
    ListItemText,
    Switch,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { UserSettings, useUserSettings } from "hooks/useUserSettings"
import { CollapsableList, CollapsableListDivider } from "../CollapsableList"

export const InputMaskSettings: React.FC = () => {
    const { userSettings, changeUserSetting } = useUserSettings()
    const theme = useTheme()

    return (
        <CollapsableList label="Eingabemasken" description="Validierung, Dashboard">
            {userSettings == null ? (
                <CircularProgress />
            ) : (
                <>
                    <ListItem>
                        <ListItemText sx={{ color: theme.palette.warning.dark }}>
                            Validierung deaktivieren
                        </ListItemText>
                        <Switch
                            checked={userSettings.enableConstrainValidation === false}
                            onChange={e =>
                                changeUserSetting({
                                    enableConstrainValidation: e.target.checked === false,
                                })
                            }
                        />
                    </ListItem>

                    <CollapsableListDivider />

                    <ListItem>
                        <ListItemText>Validierung</ListItemText>

                        <ToggleButtonGroup
                            size="small"
                            value={userSettings.constrainValidation}
                            exclusive
                            onChange={(e, value: UserSettings["constrainValidation"] | null) =>
                                changeUserSetting({ constrainValidation: value ?? "always" })
                            }
                        >
                            <ToggleButton value="always">Immer</ToggleButton>
                            <ToggleButton value="opening-closening">Öffnen/Schließen</ToggleButton>
                        </ToggleButtonGroup>
                    </ListItem>

                    <CollapsableListDivider />

                    <ListItem>
                        <ListItemText>Fehlerhafte Einträge auf dem Dashboard anzeigen</ListItemText>
                        <Switch
                            checked={userSettings.saveMismatchingRecords}
                            onChange={e =>
                                changeUserSetting({
                                    saveMismatchingRecords: e.target.checked,
                                })
                            }
                        />
                    </ListItem>
                </>
            )}
        </CollapsableList>
    )
}
