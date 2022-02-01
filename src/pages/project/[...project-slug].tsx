import { ServerTableData, TableData, makeAPI, getCurrentUser, Row } from "@api"
import NoRowsRenderer from "@components/DataGrid/NoRowsOverlay/NoRowsRenderer"
import Toolbar from "@components/DataGrid/Toolbar/Toolbar"
import * as TItem from "@components/DataGrid/Toolbar/ToolbarItems"
import Title from "@components/Head/Title"
import { ADD_BUTTON_TOKEN, Tablist } from "@components/TabList/TabList"
import { useProject } from "@app/hooks/useProject"
import {
    useAuth,
    CurrentUser,
    USER_COOKIE_KEY,
    AUTH_COOKIE_KEY,
} from "@context/AuthContext"
import { rowKeyGetter, SerializableTable } from "@datagrid/utils"
import { Box, Typography, useTheme } from "@mui/material"
import { isValidName, prepareName } from "@utils/validateName"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useSnackbar } from "notistack"
import React, { useCallback, useEffect, Suspense, useState } from "react"
import DataGrid, { RowsChangeData, CalculatedColumn } from "react-data-grid"
import LoadingSkeleton from "../../components/DataGrid/LoadingSkeleton/LoadingSkeleton"
import { DetailedViewModal } from "@components/DataGrid/Detail View/DetailedViewModal"

type ProjectSlugPageProps = {
    user: CurrentUser
    project: string
    tables: string[]
    table: { data: ServerTableData; name: string } | null
}

const ProjectSlugPage: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    // #################### states ####################

    const { user } = props
    const { API } = useAuth()
    const { state, changeTable, reload } = useProject(props.project, {
        tables: props.tables,
        currentTable: props.table?.name || "",
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

    const handleTablistChange = (newTable: string | null) => {
        if (newTable === null || newTable === ADD_BUTTON_TOKEN)
            return changeTable("")
        changeTable(newTable)
    }

    const handleRowsChange = (rows: Row[], data: RowsChangeData<Row>) => {
        // TODO: update rows
    }

    const handleAddTable = useCallback(
        async (newTableName: string) => {
            const name = prepareName(newTableName)
            const isValid = isValidName(name)
            if (isValid instanceof Error)
                return enqueueSnackbar(isValid.message, { variant: "error" })
            const nameIsTaken = state.project?.tables
                .map(tbl => tbl.toLowerCase().trim())
                .includes(name.toLowerCase().trim())
            if (nameIsTaken)
                return enqueueSnackbar(
                    "Dieser Name wird bereits für eine Tabelle in diesem Projekt verwendet!",
                    { variant: "error" }
                )
            if (!user)
                return enqueueSnackbar("Du musst dich zuvor erneut anmelden", {
                    variant: "error",
                })
            try {
                await API?.post.table(props.project, name)
                await reload(name)
                enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
                    variant: "success",
                })
            } catch (error) {
                console.error(error)
                enqueueSnackbar("Die Tabelle konnte nicht erstellt werden!", {
                    variant: "error",
                })
            }
        },
        [
            API?.post,
            enqueueSnackbar,
            props.project,
            reload,
            state.project?.tables,
            user,
        ]
    )

    const handleRenameTable = () => {
        alert("Not implemented yet")
        // TODO: implement
    }
    const handleDeleteTable = () => {
        alert("Not implemented yet")
        // TODO: implement
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
            <Title title={props.project} />
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
                    <Tablist
                        value={state.project!.currentTable}
                        data={state.project!.tables}
                        onChangeHandler={handleTablistChange}
                        onAddHandler={handleAddTable}
                        contextMenuItems={[
                            <Box onClick={handleRenameTable} key={0}>
                                Rename
                            </Box>,
                            <Box
                                onClick={handleDeleteTable}
                                key={1}
                                sx={{ color: theme.palette.warning.main }}
                            >
                                Delete
                            </Box>,
                        ]}
                    />
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
    const userCookie: string = req.cookies[USER_COOKIE_KEY]

    const user = await getCurrentUser(userCookie, authCookie).catch(e => {
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
        const _projectName = params["project-slug"]
        if (
            _projectName &&
            Array.isArray(_projectName) &&
            _projectName.length > 0
        ) {
            const projectName = _projectName[0] as string
            const tableList = await API.get.tablesList(projectName)

            let dataOfFirstTable
            if (tableList[0] && tableList[0].length > 0)
                dataOfFirstTable = await API.get.table(
                    tableList[0],
                    projectName
                )
            else dataOfFirstTable = null

            const error = tableList == null
            if (error) return { notFound: true }

            return {
                props: {
                    project: projectName,
                    tables: tableList,
                    table: dataOfFirstTable
                        ? { data: dataOfFirstTable, name: tableList[0] }
                        : null,
                    user,
                },
            }
        }
    }
    return { notFound: true }
}

export default ProjectSlugPage
