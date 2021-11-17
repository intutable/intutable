import React, { useState } from "react"
import { useRouter } from "next/router"

import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
    Typography,
    Button,
    Drawer as MuiDrawer,
    useTheme,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material"
import type { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import { styled, CSSObject, Theme } from "@mui/material/styles"
import MenuIcon from "@mui/icons-material/Menu"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import WorkspacesIcon from "@mui/icons-material/Workspaces"
import SettingsIcon from "@mui/icons-material/Settings"
import HomeIcon from "@mui/icons-material/Home"
import LoginButton from "../Login/LoginButton"
import LoginFormModal from "../Login/LoginFormModal"
import Link from "../Link/Link"
import { useAuth } from "@context/AuthContext"

const drawerWidth: number = 240

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

const Drawer = styled(MuiDrawer, { shouldForwardProp: prop => prop !== "open" })(
    ({ theme, open }) => ({
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
    })
)

type DrawerListItemProps = {
    icon: React.ReactNode
    text: string
    href: string
}

const DrawerListItem: React.FC<DrawerListItemProps> = props => {
    const router = useRouter()
    return (
        <ListItem button onClick={() => router.push(props.href)}>
            <ListItemIcon>{props.icon}</ListItemIcon>
            <ListItemText primary={props.text} />
        </ListItem>
    )
}

const Header = () => {
    const { user } = useAuth()

    const theme = useTheme()
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
    const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false)

    const toggleDrawer = () => setDrawerOpen(prev => !prev)
    const toggleLoginModal = () => setLoginModalOpen(prev => !prev)

    return (
        <>
            {/* Header */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: theme.zIndex.drawer + 1,
                    transition: theme.transitions.create(["width", "margin"], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    ...(drawerOpen && {
                        marginLeft: drawerWidth,
                        width: `calc(100% - ${drawerWidth}px)`,
                        transition: theme.transitions.create(["width", "margin"], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }),
                }}
            >
                <Toolbar
                    sx={{
                        // keeps right padding when drawer closed
                        pr: "24px",
                    }}
                >
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{
                            mr: "36px",
                            ...(drawerOpen && { display: "none" }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}>
                        <Link href="/" muiLinkProps={{ underline: "none" }}>
                            <Typography
                                variant="h6"
                                component="h1"
                                color="inherit"
                                noWrap
                                sx={{ fontWeight: theme.typography.fontWeightBold }}
                            >
                                Dekanatsverwaltung
                            </Typography>
                        </Link>
                    </Box>
                    { user && <span>{user.name}</span> }
                    <LoginButton openLoginFormModalFn={toggleLoginModal} />
                </Toolbar>
            </AppBar>

            {/* Drawer Menu */}
            <Drawer
                variant="permanent"
                open={drawerOpen}
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
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <DrawerListItem text="Startseite" href="/"
                                icon={<HomeIcon />} />
                <Divider />
                <DrawerListItem text="Projekte" href="/projects"
                                icon={<WorkspacesIcon />} />
                <Divider />
                <DrawerListItem text="Einstellungen" href="/settings"
                                icon={<SettingsIcon />} />
            </Drawer>

            {/* Login Modal */}
            <LoginFormModal open = {loginModalOpen}
                            onClose = {() => setLoginModalOpen(false)} />
        </>
    )
}

export default Header
