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
import { useUser, withSessionSsr } from "auth"
import Title from "components/Head/Title"
import Link from "components/Link"
import { useTables } from "hooks/useTables"
import type { InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"
import React, { useState } from "react"
import { SWRConfig, unstable_serialize } from "swr"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { prepareName } from "utils/validateName"

type TableContextMenuProps = {
    anchorEL: Element
    open: boolean
    onClose: () => void
    children: Array<React.ReactNode> | React.ReactNode // overwrite implicit `children`
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

type TableListProps = {
    project: ProjectDescriptor
}
const TableList: React.FC<TableListProps> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()
    const { user } = useUser()

    const { tables, error, mutate } = useTables(props.project)

    const handleCreateTable = async () => {
        try {
            const namePrompt = prompt("Benenne deine neue Tabelle!")
            if (!namePrompt) return
            const name = prepareName(namePrompt)
            await fetcher({
                url: "/api/table",

                body: {
                    user,
                    projectId: props.project.id,
                    name,
                },
            })
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
                default:
                    errMsg = "Die Tabelle konnte nicht erstellt werden!"
            }
            console.error(error)
            enqueueSnackbar(errMsg, { variant: "error" })
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
                enqueueSnackbar(
                    "Dieser Name wird bereits für eine deiner Tabellen verwendet!",
                    { variant: "error" }
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
            enqueueSnackbar("Die Tabelle wurde umbenannt.", {
                variant: "success",
            })
        } catch (error) {
            enqueueSnackbar("Die Tabelle konnte nicht umbenannt werden!", {
                variant: "error",
            })
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
            enqueueSnackbar("Tabelle wurde gelöscht.", {
                variant: "success",
            })
        } catch (error) {
            enqueueSnackbar("Tabelle konnte nicht gelöscht werden!", {
                variant: "error",
            })
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
                            project={props.project}
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

type PageProps = {
    project: ProjectDescriptor
    // fallback: JtDescriptor[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fallback: any // TODO: remove this any
}
const Page: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ fallback, project }) => (
    <SWRConfig value={{ fallback }}>
        <TableList project={project} />
    </SWRConfig>
)

export const getServerSideProps = withSessionSsr<PageProps>(async context => {
    const query = context.query as DynamicRouteQuery<
        typeof context.query,
        "projectId"
    >
    const user = context.req.session.user

    if (!user)
        return {
            notFound: true,
        }

    const projectId: ProjectDescriptor["id"] = Number.parseInt(query.projectId)

    const projects = await fetcher<ProjectDescriptor[]>({
        url: `/api/projects/${user.id}`,
        method: "GET",
    })

    const project = projects.find(p => p.id === projectId)
    if (project == null) {
        if (process.env.NODE_ENV === "production")
            throw new Error("Die Tabellen konnten nicht geladen werden.")
        return { redirect: { permanent: true, destination: "/500" } }
    }

    const tables = await fetcher<JtDescriptor[]>({
        url: `/api/tables/${project.id}`,
        method: "GET",
    })

    return {
        props: {
            project: project,
            fallback: {
                [unstable_serialize({
                    url: `/api/projects/${user.id}`,
                    method: "GET",
                })]: tables,
            },
        },
    }
})

export default Page
