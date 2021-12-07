import type {
    GetServerSideProps,
    InferGetServerSidePropsType,
    NextPage,
} from "next"
import Title from "@components/Head/Title"
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Menu,
    MenuItem,
    Box,
} from "@mui/material"
import React, { useState } from "react"
import { useRouter } from "next/dist/client/router"
import { useTheme } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { isValidName, prepareName } from "@utils/validateName"
import { useSnackbar } from "notistack"
import { getListWithProjects, addProject } from "@api"
import { isAuthenticated } from "@utils/coreinterface"
import { useAuth, User, USER_COOKIE_KEY } from "@context/AuthContext"
const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!

type ProjectContextMenuProps = {
    anchorEL: Element
    open: boolean
    onClose: () => void
    children: Array<React.ReactNode> | React.ReactNode // overwrite implicit `children`
}
const ProjectContextMenu: React.FC<ProjectContextMenuProps> = props => {
    const theme = useTheme()

    return (
        <Menu
            elevation={0}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            // transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={props.open}
            anchorEl={props.anchorEL}
            keepMounted={true}
            onClose={props.onClose}
            PaperProps={{
                sx: {
                    boxShadow: theme.shadows[1],
                },
            }}
        >
            {Array.isArray(props.children) ? (
                props.children.map((item, i) => (
                    <MenuItem key={i}>{item}</MenuItem>
                ))
            ) : (
                <MenuItem>{props.children}</MenuItem>
            )}
        </Menu>
    )
}

type ProjectCardProps = {
    url?: string
    onClick?: () => void
}
const ProjectCard: React.FC<ProjectCardProps> = props => {
    const router = useRouter()
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    const handleOpenContextMenu = (event: any) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleRenameProject = () => {
        handleCloseContextMenu()
        const newName = prompt("Gib einen neuen Namen für dein Projekt ein:")
        if (!newName) return
        // TODO: implement
        // enqueueSnackbar("Das Projekt wurde umbenannt.", { variant: "success" })
        // enqueueSnackbar("Das Projekt konnte nicht umbenannt werden!", { variant: "error" })
        alert("Not implemented yet")
    }
    const handleDeleteProject = () => {
        handleCloseContextMenu()
        const confirmed = confirm("Möchtest du dein Projekt wirklich löschen?")
        if (!confirmed) return
        // TODO: implement
        // enqueueSnackbar("Projekt wurde gelöscht.", { variant: "success" })
        // enqueueSnackbar("Projekt konnte nicht gelöscht werden!", { variant: "error" })
        alert("Not implemented yet")
    }

    return (
        <>
            <Card
                onClick={
                    props.onClick ||
                    (_ => props.url && router.push("/project/" + props.url))
                }
                onContextMenu={props.url ? handleOpenContextMenu : undefined}
                sx={{
                    minWidth: 150,
                    minHeight: 150,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    "&:hover": {
                        bgcolor: theme.palette.action.hover,
                    },
                }}
            >
                <CardContent>{props.children}</CardContent>
            </Card>
            {props.url && anchorEL && (
                <ProjectContextMenu
                    anchorEL={anchorEL}
                    open={anchorEL != null}
                    onClose={handleCloseContextMenu}
                >
                    <Box onClick={handleRenameProject}>Rename</Box>
                    <Box
                        onClick={handleDeleteProject}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        Delete
                    </Box>
                </ProjectContextMenu>
            )}
        </>
    )
}

type ProjectsPageProps = {
    projects: Array<string>
}
const ProjectsPage: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    const theme = useTheme()
    const router = useRouter()
    const { enqueueSnackbar } = useSnackbar()

    const { user, getUserAuthCookie } = useAuth()

    const handleAddProject = async () => {
        try {
            const namePrompt = prompt("Benenne Dein neues Projekt!")
            if (!namePrompt) return
            const name = prepareName(namePrompt)
            const isValid = isValidName(name)
            if (isValid instanceof Error)
                return enqueueSnackbar(isValid.message, { variant: "error" })
            const nameIsTaken = props.projects
                .map(proj => proj.toLowerCase())
                .includes(name.toLowerCase())
            if (nameIsTaken)
                return enqueueSnackbar(
                    "Dieser Name wird bereits für eines deiner Projekte verwendet!",
                    { variant: "error" }
                )
            if (!(user && getUserAuthCookie))
                return enqueueSnackbar("Bitte melde dich erneut an!", {
                    variant: "error",
                })
            // TODO: make a request to backend here and then redirect to project (this request must be blocking, otherwise and errors occurs due to false execution order)
            await addProject(user, name, getUserAuthCookie() ?? undefined)
            router.push("/project/" + name)
            enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
                variant: "success",
            })
        } catch (error) {
            console.log(error)
            return enqueueSnackbar(
                "Das Projekt konnte nicht erstellt werden!",
                { variant: "error" }
            )
        }
    }

    return (
        <>
            <Title title="Projekte" />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                Deine Projekte
            </Typography>
            <Grid container spacing={2}>
                {props.projects.map((proj, i) => (
                    <Grid item key={i}>
                        <ProjectCard url={proj}>{proj}</ProjectCard>
                    </Grid>
                ))}
                <Grid item>
                    <ProjectCard onClick={handleAddProject}>
                        <AddIcon />
                    </ProjectCard>
                </Grid>
            </Grid>
        </>
    )
}

export const getServerSideProps: GetServerSideProps<ProjectsPageProps> =
    async context => {
        const { params, req } = context
        const authCookie = req.cookies[AUTH_COOKIE_KEY]
        if (!(await isAuthenticated(authCookie).catch(e => false)))
            return {
                redirect: {
                    permanent: false,
                    destination: "/login",
                },
            }

        const user: User = { name: req.cookies[USER_COOKIE_KEY] }
        const serverRequest = await getListWithProjects(user, authCookie)
        const data: ProjectsPageProps = {
            projects: serverRequest,
        }
        const error = serverRequest == null
        if (error) return { notFound: true }
        return {
            props: data,
        }
    }

export default ProjectsPage
