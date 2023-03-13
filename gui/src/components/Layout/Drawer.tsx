import {
    AccountTree,
    AccountTreeOutlined,
    ChevronLeft,
    Dashboard,
    DashboardOutlined,
    DynamicForm,
    DynamicFormOutlined,
    History,
    HistoryOutlined,
    Home,
    HomeOutlined,
    People,
    PeopleOutlined,
    Settings,
    SettingsOutlined,
    SupportAgent,
    SupportAgentOutlined,
    Workspaces,
    WorkspacesOutlined,
} from "@mui/icons-material"
import {
    Divider,
    Drawer as MuiDrawer,
    IconButton,
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
                    <ChevronLeft />
                </IconButton>
            </Toolbar>
            <DrawerLink
                text="Startseite"
                url="/"
                nonActiveIcon={<HomeOutlined />}
                activeIcon={<Home />}
            />
            {user?.isLoggedIn && (
                <>
                    <DrawerLink
                        text="Dashboard"
                        url="/dashboard"
                        nonActiveIcon={<DashboardOutlined />}
                        activeIcon={<Dashboard />}
                    />
                    <DrawerLink
                        text="Projekte"
                        url="/projects"
                        nonActiveIcon={<WorkspacesOutlined />}
                        activeIcon={<Workspaces />}
                    />
                    <DrawerLink
                        text="Prozessverwaltung"
                        url="/manage-workflows"
                        nonActiveIcon={<AccountTreeOutlined />}
                        activeIcon={<AccountTree />}
                    />
                    <DrawerLink
                        text="Formulare"
                        url="/forms"
                        nonActiveIcon={<DynamicFormOutlined />}
                        activeIcon={<DynamicForm />}
                    />
                </>
            )}
            {user?.isLoggedIn && user?.role.roleKind === RoleKind.Admin && (
                <DrawerLink
                    text="Nutzerverwaltung"
                    url="/users"
                    nonActiveIcon={<PeopleOutlined />}
                    activeIcon={<People />}
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
                    nonActiveIcon={<HistoryOutlined />}
                    activeIcon={<History />}
                />
            )}
            <DrawerLink
                text="Service Desk"
                url="/service-desk"
                nonActiveIcon={<SupportAgentOutlined />}
                activeIcon={<SupportAgent />}
            />
            {user?.isLoggedIn && (
                <DrawerLink
                    text="Einstellungen"
                    url="/settings"
                    nonActiveIcon={<SettingsOutlined />}
                    activeIcon={<Settings />}
                />
            )}
        </Drawer>
    )
}
export default DrawerBar
