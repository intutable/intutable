import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import HomeIcon from "@mui/icons-material/Home"
import HomeIconOutlined from "@mui/icons-material/HomeOutlined"
import SettingsIcon from "@mui/icons-material/Settings"
import SettingsIconOutlined from "@mui/icons-material/SettingsOutlined"
import SupportAgentIcon from "@mui/icons-material/SupportAgent"
import SupportAgentIconOutlined from "@mui/icons-material/SupportAgentOutlined"
import WorkspacesIcon from "@mui/icons-material/Workspaces"
import WorkspacesIconOutlined from "@mui/icons-material/WorkspacesOutlined"
import DashboardIcon from "@mui/icons-material/Dashboard"
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined"
import PeopleIcon from "@mui/icons-material/People"
import PeopleIconOutlined from "@mui/icons-material/PeopleOutlined"
import {
    Divider,
    Drawer as MuiDrawer,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { CSSObject, styled, Theme } from "@mui/material/styles"
import { RoleKind } from "@backend/permissions/types"
import { useUser } from "auth"
import { useRouter } from "next/router"
import React from "react"
import HistoryIcon from "@mui/icons-material/History"
import DynamicFormIcon from "@mui/icons-material/DynamicForm"
import DynamicFormOutlinedIcon from "@mui/icons-material/DynamicFormOutlined"

const drawerWidth = 240

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
})

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(9)} + 1px)`,
    },
})

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: prop => prop !== "open",
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
    }),
}))

type DrawerListItemProps = {
    nonActiveIcon: React.ReactNode
    activeIcon: React.ReactNode
    text: string
    url: string
}

const DrawerLink: React.FC<DrawerListItemProps> = props => {
    const router = useRouter()
    const theme = useTheme()
    return (
        <ListItemButton
            onClick={() => router.push(props.url)}
            sx={{
                ...(router.pathname === props.url && {
                    bgcolor: theme.palette.action.selected,
                }),
            }}
        >
            <ListItemIcon>
                {router.pathname === props.url ? props.activeIcon : props.nonActiveIcon}
            </ListItemIcon>
            <ListItemText primary={props.text} />
        </ListItemButton>
    )
}

type DrawerProps = {
    open: boolean
    width: number
    toggle: () => void
}

const DrawerBar: React.FC<DrawerProps> = props => {
    const theme = useTheme()
    const { user } = useUser()
    return (
        <Drawer
            variant="permanent"
            open={props.open}
            sx={{ height: "100vh" }} /* component={"nav"}*/
        >
            <Toolbar
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: theme.spacing(0, 1),
                }}
            >
                <IconButton onClick={props.toggle}>
                    <ChevronLeftIcon />
                </IconButton>
            </Toolbar>
            <DrawerLink
                text="Startseite"
                url="/"
                nonActiveIcon={<HomeIconOutlined />}
                activeIcon={<HomeIcon />}
            />
            {user?.isLoggedIn && (
                <>
                    <DrawerLink
                        text="Dashboard"
                        url="/dashboard"
                        nonActiveIcon={<DashboardOutlinedIcon />}
                        activeIcon={<DashboardIcon />}
                    />
                    <DrawerLink
                        text="Projekte"
                        url="/projects"
                        nonActiveIcon={<WorkspacesIconOutlined />}
                        activeIcon={<WorkspacesIcon />}
                    />
                    <DrawerLink
                        text="Formulare"
                        url="/forms"
                        nonActiveIcon={<DynamicFormOutlinedIcon />}
                        activeIcon={<DynamicFormIcon />}
                    />
                </>
            )}
            {user?.isLoggedIn && user?.role.roleKind === RoleKind.Admin && (
                <DrawerLink
                    text="Nutzerverwaltung"
                    url="/users"
                    nonActiveIcon={<PeopleIconOutlined />}
                    activeIcon={<PeopleIcon />}
                />
            )}
            <Divider
                sx={{
                    flexGrow: 100,
                }}
            />
            {user?.isLoggedIn && (
                <DrawerLink
                    text="Änderungsverlauf"
                    url="/history"
                    nonActiveIcon={<HistoryIcon />}
                    activeIcon={<HistoryIcon />}
                />
            )}
            <DrawerLink
                text="Service Desk"
                url="/service-desk"
                nonActiveIcon={<SupportAgentIconOutlined />}
                activeIcon={<SupportAgentIcon />}
            />
            {user?.isLoggedIn && (
                <DrawerLink
                    text="Einstellungen"
                    url="/settings"
                    nonActiveIcon={<SettingsIconOutlined />}
                    activeIcon={<SettingsIcon />}
                />
            )}
        </Drawer>
    )
}
export default DrawerBar
