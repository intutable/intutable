import AddIcon from "@mui/icons-material/Add"
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Menu,
    MenuItem,
    Typography,
    useTheme,
} from "@mui/material"
import { fetchWithUser } from "api"
import { Auth } from "auth"
import Title from "components/Head/Title"
import { AUTH_COOKIE_KEY, useAuth } from "context"
import type {
    GetServerSideProps,
    InferGetServerSidePropsType,
    NextPage,
} from "next"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"
import React, { useState } from "react"
import useSWR, { SWRConfig, unstable_serialize } from "swr"
import type { PMTypes as PM } from "types"
import { isValidName, prepareName } from "utils/validateName"

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
        router.push("/project/" + props.project.id)
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
            {anchorEL && (
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

const ProjectList: React.FC = () => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()
    const { user } = useAuth()

    const {
        data: projects,
        error,
        mutate,
    } = useSWR<PM.Project[]>(
        user ? [`/api/projects/${user.id}`, user, undefined, "GET"] : null,
        fetchWithUser
    )

    const handleCreateProject = async () => {
        if (projects == null || user == null) return
        try {
            const namePrompt = prompt("Benenne Dein neues Projekt!")
            if (!namePrompt) return
            const name = prepareName(namePrompt)
            const isValid = isValidName(name)
            if (isValid instanceof Error) {
                enqueueSnackbar(isValid.message, { variant: "error" })
                return
            }
            const nameIsTaken = projects!
                .map((proj: PM.Project) => proj.name.toLowerCase())
                .includes(name.toLowerCase())
            if (nameIsTaken) {
                enqueueSnackbar(
                    "Dieser Name wird bereits für eines deiner Projekte verwendet!",
                    { variant: "error" }
                )
                return
            }
            await fetchWithUser<PM.Project>(
                "/api/project",
                user,
                { user, name },
                "POST"
            )
            await mutate()
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
        if (projects == null || user == null) return
        try {
            const name = prompt("Gib einen neuen Namen für dein Projekt ein:")
            if (!name) return
            const nameIsTaken = projects!
                .map((proj: PM.Project) => proj.name.toLowerCase())
                .includes(name.toLowerCase())
            if (nameIsTaken) {
                enqueueSnackbar(
                    "Dieser Name wird bereits für eines deiner Projekte verwendet!",
                    { variant: "error" }
                )
                return
            }
            await fetchWithUser<PM.Project>(
                `/api/project/${project.id}`,
                user,
                { newName: name },
                "PATCH"
            )
            await mutate()
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
        if (projects == null || user == null) return
        try {
            const confirmed = confirm(
                "Möchtest du dein Projekt wirklich löschen?"
            )
            if (!confirmed) return
            await fetchWithUser(
                `/api/project/${project.id}`,
                user,
                undefined,
                "DELETE"
            )
            await mutate()
            enqueueSnackbar("Projekt wurde gelöscht.", {
                variant: "success",
            })
        } catch (error) {
            enqueueSnackbar("Projekt konnte nicht gelöscht werden!", {
                variant: "error",
            })
        }
    }

    if (error) return <>Error: {error}</>
    if (projects == null) return <CircularProgress />

    return (
        <>
            <Title title="Projekte" />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                Deine Projekte
            </Typography>
            <Grid container spacing={2}>
                {projects.map((proj: PM.Project, i: number) => (
                    <Grid item key={i}>
                        <ProjectCard
                            handleDelete={handleDeleteProject}
                            handleRename={handleRenameProject}
                            project={proj}
                        >
                            {proj.name}
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

type PageProps = {
    // fallback: PM.Project.List
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fallback: any // TODO: remove this any
}
const Page: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ fallback }) => (
    <SWRConfig value={{ fallback }}>
        <ProjectList />
    </SWRConfig>
)

export const getServerSideProps: GetServerSideProps<
    PageProps
> = async context => {
    const { req } = context

    const authCookie = req.cookies[AUTH_COOKIE_KEY]
    const user = await Auth.getCurrentUser(authCookie).catch(e => {
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

    const list = await fetchWithUser<PM.Project[]>(
        `/api/projects/${user.id}`, // Note: userId is tmp
        user,
        undefined,
        "GET"
    )
    if (list == null) return { notFound: true }

    return {
        props: {
            fallback: {
                [unstable_serialize([
                    `/api/projects/${user.id}`,
                    user,
                    undefined,
                    "GET",
                ])]: list,
            },
        },
    }
}

export default Page
