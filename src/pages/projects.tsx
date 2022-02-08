import { makeAPI, ProjectManagement as PM } from "@app/api"
import { getCurrentUser } from "@app/api/utils"
import { useProjectList } from "@app/hooks/useProjectList"
import Title from "@components/Head/Title"
import { AUTH_COOKIE_KEY } from "@context/AuthContext"
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
import React, { useState } from "react"

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
type AddProjectCardProps = {
    handleCreate: () => Promise<void>
}

const AddProjectCard: React.FC<AddProjectCardProps> = props => {
    const theme = useTheme()
    return (
        <Card
            onClick={async () => {
                await props.handleCreate()
            }}
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
    )
}

type ProjectCardProps = {
    project: PM.Project
    handleRename: (project: PM.Project) => Promise<void>
    handleDelete: (project: PM.Project) => Promise<void>
    children: string
}
const ProjectCard: React.FC<ProjectCardProps> = props => {
    const router = useRouter()
    const theme = useTheme()
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)

    const handleOpenContextMenu = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleOnClick = () => {
        router.push("/project/" + props.project.projectId)
    }

    return (
        <>
            <Card
                onClick={handleOnClick}
                onContextMenu={handleOpenContextMenu}
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
                    <Box
                        onClick={async () => {
                            handleCloseContextMenu()
                            await props.handleRename(props.project)
                        }}
                    >
                        Umbenennen
                    </Box>
                    <Box
                        onClick={async () => {
                            handleCloseContextMenu()
                            await props.handleDelete(props.project)
                        }}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        Löschen
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

    const { projectList, createProject, renameProject, deleteProject } =
        useProjectList(props.projectList)

    const handleCreateProject = async () => {
        try {
            const namePrompt = prompt("Benenne Dein neues Projekt!")
            if (!namePrompt) return
            const name = prepareName(namePrompt)
            const isValid = isValidName(name)
            if (isValid instanceof Error) {
                enqueueSnackbar(isValid.message, { variant: "error" })
                return
            }
            const nameIsTaken = projectList
                .map(proj => proj.projectName.toLowerCase())
                .includes(name.toLowerCase())
            if (nameIsTaken) {
                enqueueSnackbar(
                    "Dieser Name wird bereits für eines deiner Projekte verwendet!",
                    { variant: "error" }
                )
                return
            }
            await createProject(name)
            enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
                variant: "success",
            })
        } catch (error) {
            enqueueSnackbar("Das Projekt konnte nicht erstellt werden!", {
                variant: "error",
            })
        }
    }

    const handleRenameProject = async (project: PM.Project) => {
        try {
            const newName = prompt(
                "Gib einen neuen Namen für dein Projekt ein:"
            )
            if (!newName) return
            await renameProject(project, newName)
            enqueueSnackbar("Das Projekt wurde umbenannt.", {
                variant: "success",
            })
        } catch (error) {
            enqueueSnackbar("Das Projekt konnte nicht umbenannt werden!", {
                variant: "error",
            })
        }
    }

    const handleDeleteProject = async (project: PM.Project) => {
        try {
            const confirmed = confirm(
                "Möchtest du dein Projekt wirklich löschen?"
            )
            if (!confirmed) return
            await deleteProject(project)
            router.replace(router.asPath)
            enqueueSnackbar("Projekt wurde gelöscht.", {
                variant: "success",
            })
        } catch (error) {
            enqueueSnackbar("Projekt konnte nicht gelöscht werden!", {
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
                {projectList.map((proj, i) => (
                    <Grid item key={i}>
                        <ProjectCard
                            handleDelete={handleDeleteProject}
                            handleRename={handleRenameProject}
                            project={proj}
                        >
                            {proj.projectName}
                        </ProjectCard>
                    </Grid>
                ))}
                <Grid item>
                    <AddProjectCard handleCreate={handleCreateProject}>
                        <AddIcon />
                    </AddProjectCard>
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
