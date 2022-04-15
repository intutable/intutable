import { ProjectDescriptor } from "@intutable/project-management/dist/types"
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
import { fetcher } from "api"
import { useUser, withSessionSsr } from "auth"
import Title from "components/Head/Title"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"
import React, { useEffect, useState } from "react"
import useSWR, { SWRConfig, unstable_serialize } from "swr"
import { makeError } from "utils/makeError"
import { ProtectedUserPage } from "utils/ProtectedUserPage"
import { prepareName } from "utils/validateName"

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
    children?: React.ReactNode
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
    project: ProjectDescriptor
    handleRename: (project: ProjectDescriptor) => Promise<void>
    handleDelete: (project: ProjectDescriptor) => Promise<void>
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

const Page: NextPage = () => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()
    const { user } = useUser()

    const {
        data: projects,
        error,
        mutate,
    } = useSWR<ProjectDescriptor[]>([`/api/projects`, undefined, "GET"])

    const handleCreateProject = async () => {
        if (projects == null || user == null) return
        try {
            const namePrompt = prompt("Benenne Dein neues Projekt!")
            if (!namePrompt) return
            const name = prepareName(namePrompt)
            await fetcher<ProjectDescriptor>(
                "/api/project",
                { user, name },
                "POST"
            )
            await mutate()
            enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
                variant: "success",
            })
        } catch (error) {
            const errKey = (error as Record<string, string>).error
            let errMsg: string
            switch (errKey) {
                case "alreadyTaken":
                    errMsg = `Name bereits vergeben.`
                    break
                case "invalidName":
                    errMsg =
                        `Ungültiger Name: darf nur Buchstaben, Ziffern` +
                        ` und Unterstriche enthalten.`
                    break
                default:
                    errMsg = "Das Projekt konnte nicht erstellt werden!"
            }
            enqueueSnackbar(errMsg, { variant: "error" })
        }
    }

    const handleRenameProject = async (project: ProjectDescriptor) => {
        if (projects == null || user == null) return
        try {
            const name = prompt("Gib einen neuen Namen für dein Projekt ein:")
            if (!name) return
            const nameIsTaken = projects!
                .map((proj: ProjectDescriptor) => proj.name.toLowerCase())
                .includes(name.toLowerCase())
            if (nameIsTaken) {
                enqueueSnackbar(
                    "Dieser Name wird bereits für eines deiner Projekte verwendet!",
                    { variant: "error" }
                )
                return
            }
            await fetcher<ProjectDescriptor>(
                `/api/project/${project.id}`,
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

    const handleDeleteProject = async (project: ProjectDescriptor) => {
        if (projects == null || user == null) return
        try {
            const confirmed = confirm(
                "Möchtest du dein Projekt wirklich löschen?"
            )
            if (!confirmed) return
            await fetcher(`/api/project/${project.id}`, undefined, "DELETE")
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

    if (error) return <>Error</>
    if (projects == null) return <CircularProgress />

    return (
        <>
            <Title title="Projekte" />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                Deine Projekte
            </Typography>
            <Grid container spacing={2}>
                {projects.map((proj: ProjectDescriptor, i: number) => (
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

export const getServerSideProps = ProtectedUserPage

export default Page
