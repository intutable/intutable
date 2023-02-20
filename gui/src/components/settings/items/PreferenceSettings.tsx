import {
    CircularProgress,
    ListItem,
    ListItemText,
    Switch,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material"
import { UserSettings, useUserSettings } from "hooks/useUserSettings"
import { CollapsableList, CollapsableListDivider } from "../CollapsableList"

export const PreferenceSettings: React.FC = () => {
    const { userSettings, changeUserSetting } = useUserSettings()

    return (
        <CollapsableList label="Präferenzen" description="Theme, Anrede">
            {userSettings == null ? (
                <CircularProgress />
            ) : (
                <>
                    <ListItem>
                        <ListItemText>Theme</ListItemText>

                        <ToggleButtonGroup
                            size="small"
                            value={userSettings.preferredTheme}
                            exclusive
                            onChange={(e, value: UserSettings["preferredTheme"] | null) =>
                                changeUserSetting({ preferredTheme: value ?? "system" })
                            }
                        >
                            <ToggleButton value="system">system</ToggleButton>
                            <ToggleButton value="light">hell</ToggleButton>
                            <ToggleButton value="dark">dunkel</ToggleButton>
                        </ToggleButtonGroup>
                    </ListItem>

                    <CollapsableListDivider />

                    <ListItem>
                        <ListItemText>Formelle Anrede</ListItemText>
                        <Switch
                            checked={userSettings.disableFunnyGreetings}
                            onChange={e =>
                                changeUserSetting({
                                    disableFunnyGreetings: e.target.checked,
                                })
                            }
                        />
                    </ListItem>
                </>
            )}
        </CollapsableList>
    )
}
