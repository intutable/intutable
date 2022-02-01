import { useState } from "react"
import type { NextPage } from "next"
import {
    Typography,
    Button,
    Switch,
    Divider,
    styled,
    PaletteMode,
    List,
    ListSubheader,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material"
import Title from "@components/Head/Title"
import ThemeSwitch from "../components/ThemeSwitch/ThemeSwitch"
import FlashlightOnIcon from "@mui/icons-material/FlashlightOn"
import FlashlightOffIcon from "@mui/icons-material/FlashlightOff"
import { useThemeToggler } from "./_app"
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices"

const Settings: NextPage = props => {
    const { getTheme } = useThemeToggler()
    return (
        <>
            <Title title="Einstellungen" />
            <Typography variant={"h4"}>Einstellungen</Typography>
            <Divider />

            {/* Theme */}
            <List
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    mt: 10,
                }}
                subheader={<ListSubheader>Theme</ListSubheader>}
            >
                <ListItem>
                    <ListItemIcon>
                        {getTheme() === "dark" ? (
                            <FlashlightOffIcon />
                        ) : (
                            <FlashlightOnIcon />
                        )}
                    </ListItemIcon>
                    <ListItemText
                        id="setting-theme-mode"
                        primary="Dunkles Desgin"
                    />
                    <ThemeSwitch />
                </ListItem>
                <ListItem>
                    <ListItemIcon>
                        <MiscellaneousServicesIcon />
                    </ListItemIcon>
                    <ListItemText
                        id="setting-placeholder"
                        primary="Sonstiges"
                    />
                    <Switch />
                </ListItem>
            </List>

            <List
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    mt: 5,
                }}
                subheader={<ListSubheader>Benutzerkonto</ListSubheader>}
            >
                <ListItem>
                    <ListItemIcon>
                        <MiscellaneousServicesIcon />
                    </ListItemIcon>
                    <ListItemText
                        id="setting-placeholder"
                        primary="Sonstiges"
                    />
                    <Switch />
                </ListItem>
            </List>
        </>
    )
}

export default Settings
