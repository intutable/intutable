import {
    Box,
    CircularProgress,
    ListItem,
    ListItemText,
    Switch,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { DefaultUserSettings, UserSettings, useUserSettings } from "hooks/useUserSettings"
import { CollapsableList, CollapsableListDivider } from "../CollapsableList"

export const InputMaskSettings: React.FC = () => {
    const { userSettings, changeUserSetting } = useUserSettings()
    const theme = useTheme()

    return (
        <CollapsableList
            label="Eingabemasken"
            description="Validierung, Dashboard"
            error={userSettings?.constraintValidation === "never"}
        >
            {userSettings == null ? (
                <CircularProgress />
            ) : (
                <>
                    <ListItem sx={{ flexWrap: "wrap" }}>
                        <ListItemText>Validierung</ListItemText>

                        <ToggleButtonGroup
                            size="small"
                            value={userSettings.constraintValidation}
                            exclusive
                            onChange={(e, value: UserSettings["constraintValidation"] | null) =>
                                changeUserSetting({
                                    constraintValidation:
                                        value ?? DefaultUserSettings.constraintValidation,
                                })
                            }
                        >
                            <ToggleButton value="never" color="error">
                                Aus
                            </ToggleButton>
                            <ToggleButton value="always" disabled>
                                Immer
                            </ToggleButton>
                            <ToggleButton value="opening-closening" disabled>
                                Öffnen/Schließen
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </ListItem>

                    {userSettings.constraintValidation === "never" && (
                        <Box sx={{ px: 2, my: 1, lineHeight: 0 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: theme.palette.error.main,
                                    fontSize: "60%",
                                    lineHeight: 1.2,
                                }}
                            >
                                Achtung! Schalten Sie die Constraint-Validierung nur aus, wenn Sie
                                sich sicher sind! Unerwartete Fehler können auftreten!
                            </Typography>
                        </Box>
                    )}

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
