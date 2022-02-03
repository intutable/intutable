import { ProjectManagement as PM } from "@api"
import { makeAPI } from "@app/api"
import { getCurrentUser } from "@app/api/coreinterface"
import Title from "@components/Head/Title"
import { AUTH_COOKIE_KEY, useAuth } from "@context/AuthContext"
import { useProjectCtx } from "@context/ProjectContext"
import AddIcon from "@mui/icons-material/Add"
import {
    Box,
    Card,
    CardContent,
    Grid,
    Menu,
    MenuItem,
    Typography,
    useTheme,
} from "@mui/material"
import { isValidName, prepareName } from "@utils/validateName"
import type {
    GetServerSideProps,
    InferGetServerSidePropsType,
    NextPage,
} from "next"
import { useRouter } from "next/dist/client/router"
import { useSnackbar } from "notistack"
import React, { useEffect, useState } from "react"

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
    project?: PM.Project
    onClick?: () => void
    children: string | React.ReactElement
}
const ProjectCard: React.FC<ProjectCardProps> = props => {
    const router = useRouter()
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const { user, API } = useAuth()
    const { state, renameProject, deleteProject, setProject } = useProjectCtx()

    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    const handleOpenContextMenu = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleRenameProject = async () => {
        if (props.project == null) return
        try {
            handleCloseContextMenu()
            const newName = prompt(
                "Gib einen neuen Namen für dein Projekt ein:"
            )
            if (!newName) return
            await renameProject(props.project, newName)
            router.replace(router.asPath)
            enqueueSnackbar("Das Projekt wurde umbenannt.", {
                variant: "success",
            })
        } catch (error) {
            console.log(error)
            enqueueSnackbar("Das Projekt konnte nicht umbenannt werden!", {
                variant: "error",
            })
        }
    }

    const handleDeleteProject = async () => {
        if (props.project == null) return
        try {
            if (typeof props.children !== "string") return
            handleCloseContextMenu()
            const confirmed = confirm(
                "Möchtest du dein Projekt wirklich löschen?"
            )
            if (!confirmed) return
            await deleteProject(props.project)
            router.replace(router.asPath)
            enqueueSnackbar("Projekt wurde gelöscht.", { variant: "success" })
        } catch (error) {
            console.log(error)
            enqueueSnackbar("Projekt konnte nicht gelöscht werden!", {
                variant: "error",
            })
        }
    }

    const handleOnClick = async () => {
        if (props.project) {
            await setProject(props.project)
            router.push("/project/" + props.project.projectId)
        }
    }

    return (
        <>
            <Card
                onClick={props.onClick || handleOnClick}
                onContextMenu={
                    props.project?.projectName
                        ? handleOpenContextMenu
                        : undefined
                }
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
            {props.project && anchorEL && (
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
    projectList: PM.Project.List
}
const ProjectsPage: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    const theme = useTheme()
    const router = useRouter()
    const { enqueueSnackbar } = useSnackbar()

    const { createProject } = useProjectCtx()

    const handleAddProject = async () => {
        try {
            const namePrompt = prompt("Benenne Dein neues Projekt!")
            if (!namePrompt) return
            const name = prepareName(namePrompt)
            const isValid = isValidName(name)
            if (isValid instanceof Error)
                return enqueueSnackbar(isValid.message, { variant: "error" })
            const nameIsTaken = props.projectList
                .map(proj => proj.projectName.toLowerCase())
                .includes(name.toLowerCase())
            if (nameIsTaken)
                return enqueueSnackbar(
                    "Dieser Name wird bereits für eines deiner Projekte verwendet!",
                    { variant: "error" }
                )
            await createProject(name)
            /**
             * // BUG
             * before update: we were creating a new project by name and redirected to the new project page by the new name in the url
             * after upfate: since we are using ids now, we need to route by id instead of name BUT we do not get the id back from the POST call.
             * we could fetch all projects and find id by the name but it is not guaranteed that namens are unique
             */
            // router.push("/project/" + name) // therefore this feature is not possible and we need to reload thr page to show the new project card
            router.replace(router.asPath)
            enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
                variant: "success",
            })
        } catch (error) {
            console.log(error)
            enqueueSnackbar("Das Projekt konnte nicht erstellt werden!", {
                variant: "error",
            })
        }
    }

    return (
        <>
            <Title title="Projekte" />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                Deine Projekte
            </Typography>
            <Grid container spacing={2}>
                {props.projectList.map((proj, i) => (
                    <Grid item key={i}>
                        <ProjectCard project={proj}>
                            {proj.projectName}
                        </ProjectCard>
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

export const getServerSideProps: GetServerSideProps<
    ProjectsPageProps
> = async context => {
    const { req } = context

    const authCookie = req.cookies[AUTH_COOKIE_KEY]

    const user = await getCurrentUser(authCookie).catch(e => {
        console.error(e)
        return null
    })

    if (!user)
        return {
            redirect: {
                permanent: false,
                destination: "/login",
            },
        }
    const API = makeAPI(user)

    const serverRequest = await API.get.projectsList()
    const error = serverRequest == null
    if (error) return { notFound: true }

    return {
        props: {
            projectList: serverRequest,
        },
    }
}

export default ProjectsPage
