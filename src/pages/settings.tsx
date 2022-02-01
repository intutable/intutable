import { useState } from "react"
import type { NextPage } from "next"
import {
    Typography,
    Button,
    Switch,
    FormControlLabel,
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
import DarkModeIcon from "@mui/icons-material/DarkMode"

const Settings: NextPage = props => {
    return (
        <>
            <Title title="Einstellungen" />
            <Typography variant="h3" component="h1" color="inherit">
                Nutzereinstellungen
            </Typography>
            <List
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                }}
                subheader={<ListSubheader>Theme</ListSubheader>}
            >
                <ListItem>
                    <ListItemIcon>
                        <DarkModeIcon />
                    </ListItemIcon>
                    <ListItemText
                        id="switch-list-label-wifi"
                        primary="Dunkles Desgin"
                    />
                    <ThemeSwitch />
                </ListItem>
            </List>
        </>
    )
}

export default Settings
