import { makeAPI, ProjectManagement as PM } from "@app/api"
import { Auth } from "@app/auth"
import { useTableList } from "@app/hooks/useTableList"
import { DynamicRouteQuery } from "@app/utils/DynamicRouteQuery"
import Title from "@components/Head/Title"
import Link from "@components/Link"
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

type ProjectSlugProps = {
    project: PM.Project
    tablesList: PM.Table.List
}
const ProjectSlug: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const { tableList, createTable, renameTable, deleteTable } = useTableList(
        props.project,
        props.tablesList
    )

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
            const nameIsTaken = tableList
                .map(tbl => tbl.tableName.toLowerCase())
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
            const nameIsTaken = tableList
                .map(tbl => tbl.tableName.toLowerCase())
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

    return (
        <>
            <Title title="Projekte" />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                Deine Tabellen in{" "}
                <Link href={`/projects`}>{props.project.projectName}</Link>
            </Typography>
            <Grid container spacing={2}>
                {tableList.map((tbl, i) => (
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

export const getServerSideProps: GetServerSideProps<
    ProjectSlugProps
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

    const project = (await API.get.projectsList()).find(
        proj => proj.projectId === projectId
    )
    if (project == null) return { notFound: true }

    const tablesList = await API.get.tablesList(project.projectId)

    return {
        props: {
            project: project,
            tablesList,
        },
    }
}

export default ProjectSlug
