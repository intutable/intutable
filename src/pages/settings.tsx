import Title from "components/Head/Title"
import FlashlightOffIcon from "@mui/icons-material/FlashlightOff"
import FlashlightOnIcon from "@mui/icons-material/FlashlightOn"
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices"
import {
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Switch,
    Typography,
} from "@mui/material"
import type { NextPage } from "next"
import ThemeSwitch from "components/ThemeSwitch/ThemeSwitch"
import { useThemeToggler } from "pages/_app"
import { ErrorBoundary } from "components/ErrorBoundary"

const Settings: NextPage = () => {
    const { getTheme } = useThemeToggler()
    return (
        <>
            <Title title="Einstellungen" />
            <Typography variant={"h4"}>Einstellungen</Typography>
            <Divider />

            {/* Theme */}
            <ErrorBoundary
                fallback={
                    <span>Die Einstellungen konnten nicht geladen werden.</span>
                }
            >
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
            </ErrorBoundary>
        </>
    )
}

export default Settings
