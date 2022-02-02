import { ServerTableData, TableData, makeAPI, getCurrentUser, Row } from "@api"
import NoRowsRenderer from "@components/DataGrid/NoRowsOverlay/NoRowsRenderer"
import Toolbar from "@components/DataGrid/Toolbar/Toolbar"
import * as TItem from "@components/DataGrid/Toolbar/ToolbarItems"
import Title from "@components/Head/Title"
import { ADD_BUTTON_TOKEN, Tablist } from "@components/TabList/TabList"
import { useProject } from "@app/hooks/useProject"
import { useAuth, CurrentUser, AUTH_COOKIE_KEY } from "@context/AuthContext"
import { rowKeyGetter, SerializableTable } from "@datagrid/utils"
import { Box, Typography, useTheme } from "@mui/material"
import { isValidName, prepareName } from "@utils/validateName"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useSnackbar } from "notistack"
import React, { useCallback, useEffect, Suspense, useState } from "react"
import DataGrid, { RowsChangeData, CalculatedColumn } from "react-data-grid"
import LoadingSkeleton from "../../components/DataGrid/LoadingSkeleton/LoadingSkeleton"
import { DetailedViewModal } from "@components/DataGrid/Detail View/DetailedViewModal"
import { ProjectListElement, TableList, TableListElement } from "@api"

type ProjectSlugPageProps = {
    project: ProjectListElement
    tables: TableList
    table: { data: ServerTableData; table: TableListElement } | null
}

const ProjectSlugPage: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    // #################### states ####################

    const { user, API } = useAuth()
    const { state, changeTable, reload } = useProject(props.project, {
        tables: props.tables,
        currentTable: props.table?.table || null,
        data: props.table?.data
            ? SerializableTable.deserialize(props.table.data)
            : null,
    })
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

    const handleRowsChange = (rows: Row[], data: RowsChangeData<Row>) => {
        // TODO: update rows
    }

    // #################### life cycle methods ####################

    useEffect(() => {
        if (state.error instanceof Error) {
            console.log(state.error)
            enqueueSnackbar("Die Tabelle konnte nicht geladen werden!", {
                variant: "error",
            })
        }
    }, [state.error])

    // #################### component ####################

    const ErrorComponent =
        state.error instanceof Error ? (
            <Typography>
                Error: Could not load the Table (reason: {state.error.message}
                )!
            </Typography>
        ) : state.project == null ? (
            <Typography>
                Error: Could not load the Table (reason: State Management
                Issue)!
            </Typography>
        ) : null

    return (
        <>
            <Title title={props.project.projectName} />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                {props.project}
            </Typography>

            {ErrorComponent || state.loading ? (
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
                    <Tablist />
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
                                state.project!.data
                                    ? state.project!.data.rows
                                    : []
                            }
                            columns={
                                state.project!.data
                                    ? state.project!.data.columns
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
            const projectId: ProjectListElement["projectId"] =
                Number.parseInt(projectIdStr)
            const tableList = await API.get.tablesList(projectId)

            const project = (await API.get.projectsList()).find(
                proj => proj.projectId === projectId
            )
            if (project == null) return { notFound: true }

            let dataOfFirstTable
            if (tableList.length > 0)
                dataOfFirstTable = await API.get.table(tableList[0].tableId)
            else dataOfFirstTable = null

            const error = tableList == null
            if (error) return { notFound: true }

            return {
                props: {
                    project: project,
                    tables: tableList,
                    table: dataOfFirstTable
                        ? {
                              data: dataOfFirstTable,
                              table: tableList[0],
                          }
                        : null,
                },
            }
        }
    }
    return { notFound: true }
}

export default ProjectSlugPage
