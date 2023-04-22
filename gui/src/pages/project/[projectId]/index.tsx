import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import AddIcon from "@mui/icons-material/Add"
import {
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { TableDescriptor } from "@shared/types"
import { fetcher } from "api"
import { withSessionSsr } from "auth"
import Link from "components/Link"
import MetaTitle from "components/MetaTitle"
import { useSnacki } from "hooks/useSnacki"
import { useTables, useTablesConfig } from "hooks/useTables"
import { useViews } from "hooks/useViews"
import { InferGetServerSidePropsType, NextPage } from "next"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { SWRConfig, unstable_serialize } from "swr"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { UrlObject } from "url"
import { makeError } from "utils/error-handling/utils/makeError"
import { prepareName } from "utils/validateName"
import { withSSRCatch } from "utils/withSSRCatch"

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
    table: TableDescriptor
    children: string
}
const TableCard: React.FC<TableCardProps> = props => {
    const router = useRouter()
    const theme = useTheme()
    const [anchorEL, setAnchorEL] = useState<Element | null>(null)
    const { snackError } = useSnacki()
    const { mutate } = useTables({ project: props.project })
    const { views } = useViews({ table: props.table })

    const handleOpenContextMenu = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault()
        setAnchorEL(event.currentTarget)
    }
    const handleCloseContextMenu = () => setAnchorEL(null)

    const handleOnClick = () => {
        // const defaultView = views![0]
        const url: UrlObject = {
            pathname: `/project/${props.project.id}/table/${props.table.id}`,
            // query: {
            //     viewId: defaultView.id,
            // },
        }
        const as = `/project/${props.project.id}/table/${props.table.id}`
        router.push(url, as)
    }

    const renameTable = async () => {
        try {
            const name = prompt("Gib einen neuen Namen für deine Tabelle ein:")
            if (!name) return
            await fetcher({
                url: `/api/table/${props.table.id}`,
                body: {
                    newName: name,
                    project: props.project,
                },
                method: "PATCH",
            })
            await mutate()
        } catch (error) {
            const err = makeError(error)
            if (err.message === "alreadyTaken")
                snackError("Dieser Name wird bereits für eine deiner Tabellen verwendet!")
            else snackError("Die Tabelle konnte nicht umbenannt werden!")
        }
    }

    const deleteTable = async () => {
        try {
            const confirmed = confirm("Möchtest du deine Tabelle wirklich löschen?")
            if (!confirmed) return
            await fetcher({
                url: `/api/table/${props.table.id}`,
                method: "DELETE",
            })
            await mutate()
        } catch (error) {
            snackError("Tabelle konnte nicht gelöscht werden!")
        }
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
                <Menu
                    elevation={0}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    // transformOrigin={{ vertical: "top", horizontal: "right" }}
                    open={anchorEL !== null}
                    anchorEl={anchorEL}
                    onClose={handleCloseContextMenu}
                    PaperProps={{
                        sx: {
                            boxShadow: theme.shadows[1],
                        },
                    }}
                >
                    <MenuItem
                        onClick={() => {
                            handleCloseContextMenu()
                            renameTable()
                        }}
                    >
                        Umbenennen
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleCloseContextMenu()
                            deleteTable()
                        }}
                        sx={{ color: theme.palette.warning.main }}
                    >
                        Löschen
                    </MenuItem>
                </Menu>
            )}
        </>
    )
}

type TableListProps = {
    project: ProjectDescriptor
}
const TableList: React.FC<TableListProps> = ({ project }) => {
    const theme = useTheme()
    const { snackError } = useSnacki()

    const { tables, error, mutate } = useTables({ project: project })

    const handleCreateTable = async () => {
        try {
            const namePrompt = prompt("Benenne deine neue Tabelle!")
            if (!namePrompt) return
            const name = prepareName(namePrompt)
            await fetcher({
                url: "/api/table",
                body: {
                    projectId: project.id,
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

    if (error) return <>Error: {error}</>
    if (tables == null) return <CircularProgress />

    return (
        <>
            <MetaTitle title="Projekte" />
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
                {tables.map((tbl: TableDescriptor, i: number) => (
                    <Grid item key={i}>
                        <TableCard table={tbl} project={project}>
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
    fallback: { [cackeKey: string]: TableDescriptor[] }
}
const Page: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
    fallback,
    project,
}) => (
    <SWRConfig value={{ fallback }}>
        <TableList project={project} />
    </SWRConfig>
)

export const getServerSideProps = withSSRCatch(
    withSessionSsr<PageProps>(async context => {
        const query = context.query as DynamicRouteQuery<typeof context.query, "projectId">
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

        const projects = await fetcher<ProjectDescriptor[]>({
            url: `/api/projects`,
            method: "GET",
            headers: context.req.headers as HeadersInit,
        })

        const project = projects.find(p => p.id === projectId)
        if (project == null) return { notFound: true }

        const tables = await fetcher<TableDescriptor[]>({
            url: `/api/tables/${project.id}`,
            method: "GET",
            headers: context.req.headers as HeadersInit,
        })

        return {
            props: {
                project,
                fallback: {
                    [unstable_serialize(useTablesConfig.cacheKey(projectId))]: tables,
                },
            },
        }
    })
)

export default Page
