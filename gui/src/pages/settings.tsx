import FlashlightOffIcon from "@mui/icons-material/FlashlightOff"
import FlashlightOnIcon from "@mui/icons-material/FlashlightOn"
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices"
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Switch,
    TextField,
    Tooltip,
    Typography,
    Divider,
    List,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material"
import MetaTitle from "components/MetaTitle"

import type { NextPage } from "next"
import RememberMeIcon from "@mui/icons-material/RememberMe"
import { useState } from "react"
import TimelapseIcon from "@mui/icons-material/Timelapse"
import InfoIcon from "@mui/icons-material/Info"
import { useUser } from "auth"
import PersonIcon from "@mui/icons-material/Person"
import { useUserSettings } from "hooks/useUserSettings"
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople"
import { CollapsableList } from "components/settings/CollapsableList"
import { UserAccountSettings } from "components/settings/items/UserAccountSettings"
import { PreferenceSettings } from "components/settings/items/PreferenceSettings"
import { InputMaskSettings } from "components/settings/items/InputMaskSettings"

// TODO: make each List collapsable

const ListIconWithTooltip: React.FC<{
    children: React.ReactNode
    tooltip: string
}> = props => {
    const [hover, setHover] = useState<boolean>(false)

    return (
        <ListItemIcon onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {hover ? (
                <Tooltip title={props.tooltip} arrow>
                    <InfoIcon
                        sx={{
                            cursor: "pointer",
                        }}
                    />
                </Tooltip>
            ) : (
                props.children
            )}
        </ListItemIcon>
    )
}

type UserAccountSettings = {
    rememberMe: boolean
    sessionDuration: number
}

const Settings: NextPage = () => {
    const { user } = useUser()
    const { userSettings } = useUserSettings()

    const [accountSettings, setAccountSettings] = useState<UserAccountSettings>({
        rememberMe: true,
        sessionDuration: 14,
    })

    const updateAccountSettings = <T extends keyof UserAccountSettings>(
        key: T,
        value: UserAccountSettings[T]
    ) => {
        setAccountSettings(prev => ({
            ...prev,
            [key]: value,
        }))
    }

    if (user == null || userSettings == null) return null

    return (
        <>
            <MetaTitle title="Einstellungen" />
            <Typography variant={"h4"}>Einstellungen</Typography>
            <Divider />

            <UserAccountSettings />

            <PreferenceSettings />

            <InputMaskSettings />

            {user?.isLoggedIn && (
                <List>
                    <ListItem>
                        <ListIconWithTooltip tooltip="Ihre Anmeldedaten werden gespeichert, um bei Ihrer nächsten Anmeldung automatisch eingeloggt zu werden.">
                            <RememberMeIcon />
                        </ListIconWithTooltip>
                        <ListItemText
                            id="setting-placeholder"
                            primary="Mein Benutzer-Konto merken"
                        />
                        <Switch
                            checked={accountSettings.rememberMe}
                            disabled
                            onChange={e => updateAccountSettings("rememberMe", e.target.checked)}
                        />
                    </ListItem>

                    {accountSettings.rememberMe && (
                        <ListItem>
                            <ListIconWithTooltip tooltip="Geben Sie die Zeit an, für wie lange wir Ihre Anmeldedaten speichern sollen.">
                                <TimelapseIcon />
                            </ListIconWithTooltip>
                            <ListItemText id="setting-placeholder" primary="Session-Dauer" />
                            <TextField
                                disabled
                                type="number"
                                value={accountSettings.sessionDuration}
                                onChange={e => {}}
                                sx={{
                                    width: "70px",
                                }}
                            />
                        </ListItem>
                    )}
                </List>
            )}
        </>
    )
}

export default Settings
