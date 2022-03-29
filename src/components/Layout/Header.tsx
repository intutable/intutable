import { Avatar } from "components/LoginOutRegister"
import Link from "components/Link"
import { useAuth } from "context"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import HomeIcon from "@mui/icons-material/Home"
import HomeIconOutlined from "@mui/icons-material/HomeOutlined"
import MenuIcon from "@mui/icons-material/Menu"
import SettingsIcon from "@mui/icons-material/Settings"
import SettingsIconOutlined from "@mui/icons-material/SettingsOutlined"
import SupportAgentIcon from "@mui/icons-material/SupportAgent"
import SupportAgentIconOutlined from "@mui/icons-material/SupportAgentOutlined"
import WorkspacesIcon from "@mui/icons-material/Workspaces"
import WorkspacesIconOutlined from "@mui/icons-material/WorkspacesOutlined"
import {
    AppBar,
    Box,
    Divider,
    Drawer as MuiDrawer,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Typography,
    useTheme,
} from "@mui/material"
import { CSSObject, styled, Theme } from "@mui/material/styles"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { Search, SearchIconWrapper, StyledInputBase } from "./SearchBar"
import SearchIcon from "@mui/icons-material/Search"

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
    href: string
}

const DrawerListItem: React.FC<DrawerListItemProps> = props => {
    const router = useRouter()
    return (
        <ListItem
            button
            onClick={() => router.push(props.href)}
            sx={{
                ...(router.pathname === props.href && {
                    bgcolor: "#dedede",
                }),
                "&:hover": {},
            }}
        >
            <ListItemIcon>
                {router.pathname === props.href
                    ? props.activeIcon
                    : props.nonActiveIcon}
            </ListItemIcon>
            <ListItemText primary={props.text} />
        </ListItem>
    )
}

const Header = () => {
    const { user } = useAuth()
    const theme = useTheme()

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)

    const toggleDrawer = () => setDrawerOpen(prev => !prev)

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
                        transition: theme.transitions.create(
                            ["width", "margin"],
                            {
                                easing: theme.transitions.easing.sharp,
                                duration:
                                    theme.transitions.duration.enteringScreen,
                            }
                        ),
                    }),
                }}
            >
                <Toolbar
                    sx={{
                        // keeps right padding when drawer closed
                        pr: "24px",
                        // ...theme.mixins.toolbar,
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
                        <Stack direction="row" sx={{ alignItems: "center" }}>
                            <Link href="/" muiLinkProps={{ underline: "none" }}>
                                <Typography
                                    variant="h6"
                                    component="h1"
                                    color="inherit"
                                    noWrap
                                    sx={{
                                        fontWeight:
                                            theme.typography.fontWeightBold,
                                    }}
                                >
                                    Dekanatsverwaltung
                                </Typography>
                            </Link>
                            <Search>
                                <SearchIconWrapper>
                                    <SearchIcon />
                                </SearchIconWrapper>
                                <StyledInputBase
                                    placeholder="Search…"
                                    inputProps={{ "aria-label": "search" }}
                                />
                            </Search>
                        </Stack>
                    </Box>
                    <Avatar />
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
                <DrawerListItem
                    text="Startseite"
                    href="/"
                    nonActiveIcon={<HomeIconOutlined />}
                    activeIcon={<HomeIcon />}
                />
                {user && (
                    <DrawerListItem
                        text="Projekte"
                        href="/projects"
                        nonActiveIcon={<WorkspacesIconOutlined />}
                        activeIcon={<WorkspacesIcon />}
                    />
                )}
                <Divider />
                <DrawerListItem
                    text="Service Desk"
                    href="/service-desk"
                    nonActiveIcon={<SupportAgentIconOutlined />}
                    activeIcon={<SupportAgentIcon />}
                />
                <DrawerListItem
                    text="Einstellungen"
                    href="/settings"
                    nonActiveIcon={<SettingsIconOutlined />}
                    activeIcon={<SettingsIcon />}
                />
            </Drawer>
        </>
    )
}

export default Header
