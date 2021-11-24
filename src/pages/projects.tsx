import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import Title from "../components/Head/Title"
import {
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Typography,
} from "@mui/material"
import React from "react"
import { useRouter } from "next/dist/client/router"
import { useTheme } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { isValidName, prepareName } from "../utils/validateName"
import { useSnackbar } from "notistack"

import { getProjects } from "@utils/getData"
import { isAuthenticated, AUTH_COOKIE_KEY } from "@utils/coreinterface"

type ProjectCardProps = {
    url?: string
    onClick?: () => void
}
const ProjectCard: React.FC<ProjectCardProps> = props => {
    const router = useRouter()
    const theme = useTheme()

    return (
        <Card
            onClick={
                props.onClick ||
                (_ => props.url && router.push("/project/" + props.url))
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

    const handleAddProject = () => {
        const namePrompt = prompt("Benenne Dein neues Projekt!")
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
        // TODO: make a request to backend here and then redirect to project (this request must be blocking, otherwise and errors occurs due to false execution order)
        router.push("/project/" + name)
        enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
            variant: "success",
        })
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

        if(!(await isAuthenticated(authCookie).catch(e => false)))
            return {
                redirect: {
                    permanent: false,
                    destination: "/login"
                }
            }

        const user = { name: "nick@baz.org" } // TODO: get user
        const serverRequest = await getProjects(user, authCookie)
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
