import { getCurrentUser, makeAPI, ProjectManagement as PM, Row } from "@api"
import { TableSwitcher } from "@app/components/TableSwitcher/TableSwitcher"
import { DetailedViewModal } from "@components/DataGrid/Detail View/DetailedViewModal"
import Toolbar from "@components/DataGrid/Toolbar/Toolbar"
import * as TItem from "@components/DataGrid/Toolbar/ToolbarItems"
import Title from "@components/Head/Title"
import { AUTH_COOKIE_KEY, useAuth } from "@context/AuthContext"
import { Box, Typography, useTheme } from "@mui/material"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useSnackbar } from "notistack"
import React, { useEffect, useState } from "react"
import { CalculatedColumn, RowsChangeData } from "react-data-grid"
import LoadingSkeleton from "../../components/DataGrid/LoadingSkeleton/LoadingSkeleton"
import DataGrid from "react-data-grid"
import NoRowsRenderer from "@components/DataGrid/NoRowsOverlay/NoRowsRenderer"
import { rowKeyGetter } from "@components/DataGrid/utils"
import { useProjectCtx } from "@app/context/ProjectContext"

type ProjectSlugPageProps = {
    project: PM.Project
}

const ProjectSlugPage: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    // #################### states ####################

    const { state, loading, error, setProject, setTable } = useProjectCtx()
    const { API, loading: authLoading } = useAuth()
    // const proxy: TableData = {}
    // const [table, _setTable] = useState<TableData>(proxy)
    // const setTable = (table: TableData) => {
    //     // TODO: write to table only via proxy
    // }
    const [detailedViewOpen, setDetailedViewOpen] = useState<{
        row: Row
        column: CalculatedColumn<Row>
    } | null>(null)

    // #################### private methods ####################

    const handleRowsChange = async (rows: Row[], data: RowsChangeData<Row>) => {
        const changedRow = rows.find(
            row => rowKeyGetter(row) === data.indexes[0]
        )
        const changedCol = data.column.key

        console.log(JSON.stringify(rows))
        console.log(JSON.stringify(data))
        // Temporaray fix
        const currentProjectId = props.project.projectId
        const currentTable = state!.currentTable!.table!

        await API!.put.row(
            // THIS NEEDS TO GO
            "p" + currentProjectId + "_" + currentTable.tableName,
            ["_id", changedRow["_id"]],
            { [changedCol]: changedRow[changedCol] }
        )
        await API!.get
            .table(currentTable.tableId)
            .then(data => setTable(data.table))
    }

    useEffect(() => {
        // BUG: hacky workaround to preserve state on page reload
        if (state == null && loading === false) {
            setProject(props.project)
        }
    }, [loading, props.project, setProject, state])

    // #################### life cycle methods ####################

    useEffect(() => {
        if (
            state == null &&
            API &&
            loading === false &&
            authLoading === false
        ) {
            setProject(props.project)
        }
    }, [state, props.project])

    useEffect(() => {
        if (error instanceof Error) {
            console.log(error)
            enqueueSnackbar("Die Tabelle konnte nicht geladen werden!", {
                variant: "error",
            })
        }
    }, [error])

    // #################### component ####################

    const ErrorComponent =
        error instanceof Error ? (
            <Typography>
                Error: Could not load the Table (reason: {error.message}
                )!
            </Typography>
        ) : state?.project == null ? (
            <Typography>
                Error: Could not load the Table (reason: State Management
                Issue)!
            </Typography>
        ) : null

    return (
        <>
            <Title title={props.project.projectName} />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                {props.project.projectName}
            </Typography>

            {ErrorComponent || loading ? (
                <LoadingSkeleton />
            ) : (
                <>
                    {detailedViewOpen && (
                        <DetailedViewModal
                            open={detailedViewOpen != null}
                            data={detailedViewOpen}
                            onCloseHandler={() => setDetailedViewOpen(null)}
                        />
                    )}
                    <TableSwitcher />
                    <Box>
                        <Toolbar position="top">
                            <TItem.AddCol />
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 1
                            </Toolbar.Item>
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 2
                            </Toolbar.Item>
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 3
                            </Toolbar.Item>
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 4
                            </Toolbar.Item>
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 5
                            </Toolbar.Item>
                            <TItem.FileDownload getData={() => []} />
                        </Toolbar>
                        <DataGrid
                            className={"rdg-" + theme.palette.mode}
                            rows={
                                state?.currentTable
                                    ? state.currentTable.rows
                                    : []
                            }
                            columns={
                                state?.currentTable
                                    ? state.currentTable.columns
                                    : [{ key: "id", name: "ID" }]
                            }
                            noRowsFallback={<NoRowsRenderer />}
                            rowKeyGetter={rowKeyGetter}
                            defaultColumnOptions={{
                                sortable: true,
                                resizable: true,
                            }}
                            onRowsChange={handleRowsChange}
                            // onColumnResize={}
                            onRowDoubleClick={(row, column) => {
                                setDetailedViewOpen({ row, column })
                            }}
                            // onFill={handleFill}
                            // selectedRows={selectedRows}
                            // onSelectedRowsChange={setSelectedRows}
                        />
                        <Toolbar position="bottom">
                            <TItem.Connection status={"connected"} />
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 1
                            </Toolbar.Item>
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 2
                            </Toolbar.Item>
                        </Toolbar>
                    </Box>
                </>
            )}
        </>
    )
}

export const getServerSideProps: GetServerSideProps<
    ProjectSlugPageProps
> = async context => {
    const { params, req } = context

    const authCookie: string = req.cookies[AUTH_COOKIE_KEY]

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

    if (params && Object.hasOwnProperty.call(params, "project-slug")) {
        const _projectId = params["project-slug"]
        if (_projectId != null) {
            const projectIdStr = Array.isArray(_projectId)
                ? _projectId[0]
                : _projectId
            const projectId: PM.Project.ID = Number.parseInt(projectIdStr)

            const project = (await API.get.projectsList()).find(
                proj => proj.projectId === projectId
            )
            if (project == null) return { notFound: true }

            return {
                props: {
                    project: project,
                },
            }
        }
    }
    return { notFound: true }
}

export default ProjectSlugPage
