import { JtDescriptor } from "@intutable/join-tables/dist/types"
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
import { withSessionSsr } from "auth"
import Title from "components/Head/Title"
import Link from "components/Link"
import { useProjects } from "hooks/useProjects"
import { useSnacki } from "hooks/useSnacki"
import { useTables } from "hooks/useTables"
import { InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { prepareName } from "utils/validateName"

type TableContextMenuProps = {
    anchorEL: Element
    open: boolean
    onClose: () => void
    children?: React.ReactNode
}
const TableContextMenu: React.FC<TableContextMenuProps> = props => {
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
type AddTableCardProps = {
    handleCreate: () => Promise<void>
    children?: React.ReactNode
}

const TableProjectCard: React.FC<AddTableCardProps> = props => {
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

type TableCardProps = {
    project: ProjectDescriptor
    table: JtDescriptor
    handleRename: (joinTable: JtDescriptor) => Promise<void>
    handleDelete: (joinTable: JtDescriptor) => Promise<void>
    children: string
}
const TableCard: React.FC<TableCardProps> = props => {
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
        router.push("/project/" + props.project.id + "/table/" + props.table.id)
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
                <TableContextMenu
                    anchorEL={anchorEL}
                    open={anchorEL != null}
                    onClose={handleCloseContextMenu}
                >
                    <Box
                        onClick={async () => {
                            handleCloseContextMenu()
                            await props.handleRename(props.table)
                        }}
                    >
                        Umbenennen
                    </Box>
                    <Box
                        onClick={async () => {
                            handleCloseContextMenu()
                            await props.handleDelete(props.table)
                        }}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        Löschen
                    </Box>
                </TableContextMenu>
            )}
        </>
    )
}

type PageProps = {
    projectId: ProjectDescriptor["id"]
}
const Page: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    const theme = useTheme()
    const { snackError } = useSnacki()

    const { projects } = useProjects()
    const project = projects
        ? projects.find(p => p.id === props.projectId)
        : null
    const { tables, error, mutate } = useTables(project)

    const handleCreateTable = async () => {
        try {
            const namePrompt = prompt("Benenne deine neue Tabelle!")
            if (!namePrompt) return
            const name = prepareName(namePrompt)
            await fetcher({
                url: "/api/table",
                body: {
                    projectId: props.projectId,
                    name,
                },
            })
            await mutate()
        } catch (error) {
            const errKey = (error as Record<string, string>).error
            let errMsg: string
            switch (errKey) {
                case "alreadyTaken":
                    errMsg = `Name bereits vergeben.`
                    break
                default:
                    errMsg = "Die Tabelle konnte nicht erstellt werden!"
            }
            snackError(errMsg)
        }
    }

    const handleRenameTable = async (joinTable: JtDescriptor) => {
        try {
            const name = prompt("Gib einen neuen Namen für deine Tabelle ein:")
            if (!name) return
            const nameIsTaken = tables!
                .map((tbl: JtDescriptor) => tbl.name.toLowerCase())
                .includes(name.toLowerCase())
            if (nameIsTaken) {
                snackError(
                    "Dieser Name wird bereits für eine deiner Tabellen verwendet!"
                )
                return
            }
            await fetcher({
                url: `/api/table/${joinTable.id}`,

                body: {
                    newName: name,
                },
                method: "PATCH",
            })
            await mutate()
        } catch (error) {
            snackError("Die Tabelle konnte nicht umbenannt werden!")
        }
    }

    const handleDeleteTable = async (joinTable: JtDescriptor) => {
        try {
            const confirmed = confirm(
                "Möchtest du deine Tabelle wirklich löschen?"
            )
            if (!confirmed) return
            await fetcher({
                url: `/api/table/${joinTable.id}`,
                method: "DELETE",
            })
            await mutate()
        } catch (error) {
            snackError("Tabelle konnte nicht gelöscht werden!")
        }
    }

    if (error) return <>Error: {error}</>
    if (tables == null) return <CircularProgress />

    return (
        <>
            <Title title="Projekte" />
            <Typography
                sx={{
                    mb: theme.spacing(4),
                    color: theme.palette.text.secondary,
                }}
            >
                Zurück zur{" "}
                <Link
                    href={`/projects`}
                    muiLinkProps={{
                        underline: "hover",
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                    }}
                >
                    {"Gesamtübersicht"}
                </Link>
            </Typography>
            <Grid container spacing={2}>
                {tables.map((tbl: JtDescriptor, i: number) => (
                    <Grid item key={i}>
                        <TableCard
                            table={tbl}
                            handleDelete={handleDeleteTable}
                            handleRename={handleRenameTable}
                            project={project!}
                        >
                            {tbl.name}
                        </TableCard>
                    </Grid>
                ))}
                <Grid item>
                    <TableProjectCard handleCreate={handleCreateTable}>
                        <AddIcon />
                    </TableProjectCard>
                </Grid>
            </Grid>
        </>
    )
}

export const getServerSideProps = withSessionSsr<PageProps>(async context => {
    const query = context.query as DynamicRouteQuery<
        typeof context.query,
        "projectId"
    >
    const user = context.req.session.user

    if (user == null || user.isLoggedIn === false)
        return {
            notFound: true,
        }

    const projectId: ProjectDescriptor["id"] = Number.parseInt(query.projectId)
    if (isNaN(projectId))
        return {
            notFound: true,
        }

    return {
        props: {
            projectId,
        },
    }
})

export default Page
