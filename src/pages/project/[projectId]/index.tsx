/**
 * Don't worry, this messy file will be deprecated in the future.
 * No need to split this up.
 */

import { makeAPI, Routes } from "api"
import type { PMTypes as PM } from "types"
import { Auth } from "auth"
import { useTableList } from "hooks"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import Title from "components/Head/Title"
import Link from "components/Link"
import { AUTH_COOKIE_KEY } from "context"
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
import { isValidName, prepareName } from "utils/validateName"
import type {
    GetServerSideProps,
    InferGetServerSidePropsType,
    NextPage,
} from "next"
import { useRouter } from "next/router"
import { useSnackbar } from "notistack"
import React, { useState } from "react"
import { SWRConfig, unstable_serialize } from "swr"

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
    project: PM.Project
    table: PM.Table
    handleRename: (project: PM.Table) => Promise<void>
    handleDelete: (project: PM.Table) => Promise<void>
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
        router.push(
            "/project/" +
                props.project.projectId +
                "/table/" +
                props.table.tableId
        )
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
    project: PM.Project
}
const TableList: React.FC<TableListProps> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const { tableList, error, createTable, renameTable, deleteTable } =
        useTableList(props.project)

    const handleCreateTable = async () => {
        try {
            const namePrompt = prompt("Benenne deine neue Tabelle!")
            if (!namePrompt) return
            const name = prepareName(namePrompt)
            const isValid = isValidName(name)
            if (isValid instanceof Error) {
                enqueueSnackbar(isValid.message, { variant: "error" })
                return
            }
            const nameIsTaken = tableList!
                .map((tbl: PM.Table) => tbl.tableName.toLowerCase())
                .includes(name.toLowerCase())
            if (nameIsTaken) {
                enqueueSnackbar(
                    "Dieser Name wird bereits für eine deiner Tabellen verwendet!",
                    { variant: "error" }
                )
                return
            }
            await createTable(name)
            enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
                variant: "success",
            })
        } catch (error) {
            enqueueSnackbar("Die Tabelle konnte nicht erstellt werden!", {
                variant: "error",
            })
        }
    }

    const handleRenameTable = async (table: PM.Table) => {
        try {
            const name = prompt("Gib einen neuen Namen für deine Tabelle ein:")
            if (!name) return
            const nameIsTaken = tableList!
                .map((tbl: PM.Table) => tbl.tableName.toLowerCase())
                .includes(name.toLowerCase())
            if (nameIsTaken) {
                enqueueSnackbar(
                    "Dieser Name wird bereits für eine deiner Tabellen verwendet!",
                    { variant: "error" }
                )
                return
            }
            await renameTable(table, name)
            enqueueSnackbar("Die Tabelle wurde umbenannt.", {
                variant: "success",
            })
        } catch (error) {
            enqueueSnackbar("Die Tabelle konnte nicht umbenannt werden!", {
                variant: "error",
            })
        }
    }

    const handleDeleteTable = async (table: PM.Table) => {
        try {
            const confirmed = confirm(
                "Möchtest du deine Tabelle wirklich löschen?"
            )
            if (!confirmed) return
            await deleteTable(table)
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
    if (tableList == null) return <CircularProgress />

    return (
        <>
            <Title title="Projekte" />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                Deine Tabellen in{" "}
                <Link href={`/projects`}>{props.project.projectName}</Link>
            </Typography>
            <Grid container spacing={2}>
                {tableList.map((tbl: PM.Table, i: number) => (
                    <Grid item key={i}>
                        <TableCard
                            table={tbl}
                            handleDelete={handleDeleteTable}
                            handleRename={handleRenameTable}
                            project={props.project}
                        >
                            {tbl.tableName}
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
    project: PM.Project
    // fallback: PM.Table.List
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

export const getServerSideProps: GetServerSideProps<
    PageProps
> = async context => {
    const { req } = context
    const query = context.query as DynamicRouteQuery<
        typeof context.query,
        "projectId"
    >

    const authCookie: string = req.cookies[AUTH_COOKIE_KEY]

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
    const API = makeAPI(user)

    const projectId: PM.Project.ID = Number.parseInt(query.projectId)

    const project = (await API.get.projectList()).find(
        (proj: PM.Project) => proj.projectId === projectId
    )
    if (project == null) return { notFound: true }

    const list = await API.get.tableList(project.projectId)

    return {
        props: {
            project: project,
            fallback: {
                [unstable_serialize([
                    Routes.get.tableList,
                    user,
                    { projectId: project.projectId },
                ])]: list,
            },
        },
    }
}

export default Page