import { NextPage } from "next"
import Title from "../components/Head/Title"
import { CircularProgress, Grid, Card, CardContent } from "@mui/material"
import React from "react"
import { useProject } from "../utils/useProject"

type ProjectCardProps = {}
const ProjectCard: React.FC<ProjectCardProps> = props => {
    return (
        <Card>
            <CardContent>{props.children}</CardContent>
        </Card>
    )
}

const ProjectsPage: NextPage = () => {
    const { projects } = useProject()

    if (projects.length === 0) return <CircularProgress />

    return (
        <>
            <Title title="Projekte" />
            <Grid container spacing={2}>
                {projects.map(proj => (
                    <Grid item xs={4}>
                        <ProjectCard>{proj}</ProjectCard>
                    </Grid>
                ))}
            </Grid>
        </>
    )
}

export default ProjectsPage
