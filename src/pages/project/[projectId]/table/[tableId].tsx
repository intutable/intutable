import { makeAPI } from "@api"
import { getCurrentUser, ProjectManagement as PM } from "@api/utils"
import { TableNavigator } from "@app/components/TableNavigator"
import { TableCtxProvider, useTableCtx } from "@app/context/TableContext"
import { Row, SerializedTableData, TableData } from "@app/types/types"
import { DynamicRouteQuery } from "@app/utils/DynamicRouteQuery"
import { DetailedViewModal } from "@components/DataGrid/Detail View/DetailedViewModal"
import LoadingSkeleton from "@components/DataGrid/LoadingSkeleton/LoadingSkeleton"
import NoRowsRenderer from "@components/DataGrid/NoRowsOverlay/NoRowsRenderer"
import Toolbar from "@components/DataGrid/Toolbar/Toolbar"
import * as ToolbarItem from "@components/DataGrid/Toolbar/ToolbarItems"
import { rowKeyGetter } from "@components/DataGrid/utils"
import Title from "@components/Head/Title"
import { AUTH_COOKIE_KEY, useAuth } from "@context/AuthContext"
import { Box, Typography, useTheme } from "@mui/material"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import { useSnackbar } from "notistack"
import React, { useEffect, useState } from "react"
import DataGrid, { CalculatedColumn, RowsChangeData } from "react-data-grid"
import Link from "@components/Link"

type TablePageProps = {
    project: PM.Project
    tableList: PM.Table.List
    currentTable: PM.Table
}

const TablePage: React.FC<TablePageProps> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    // #################### states ####################

    const [detailedViewOpen, setDetailedViewOpen] = useState<{
        row: Row
        column: CalculatedColumn<Row>
    } | null>(null)

    const { tableData, error, loading } = useTableCtx()

    // #################### private methods ####################

    const handleRowsChange = async (rows: Row[], data: RowsChangeData<Row>) => {
        // const changedRow = rows.find(
        //     row => rowKeyGetter(row) === data.indexes[0]
        // )!
        // const changedCol = data.column.key
        // console.log(JSON.stringify(rows))
        // console.log(JSON.stringify(data))
        // // Temporaray fix
        // const currentProjectId = props.project.projectId
        // const currentTable = state!.currentTable!.table!
        // await API!.put
        //     .row(
        //         // THIS NEEDS TO GO
        //         "p" + currentProjectId + "_" + currentTable.tableName,
        //         ["_id", changedRow["_id"]],
        //         { [changedCol]: changedRow[changedCol] }
        //     )
    }

    // #################### life cycle methods ####################

    useEffect(() => {
        console.info(tableData)
    }, [tableData])

    // #################### component ####################

    return (
        <>
            <Title title={props.project.projectName} />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                <Link href={`/projects`}>{props.project.projectName}</Link>{" "}
                {"> "}
                <Link href={`/project/${props.project.projectId}`}>
                    {props.currentTable.tableName}
                </Link>
            </Typography>

            {error ? (
                error.message
            ) : loading ? (
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
                    <TableNavigator
                        project={props.project}
                        currentTable={props.currentTable}
                        tableList={props.tableList}
                    />
                    <Box>
                        <Toolbar position="top">
                            <ToolbarItem.AddCol />
                            <ToolbarItem.FileDownload getData={() => []} />
                        </Toolbar>
                        <DataGrid
                            className={"rdg-" + theme.palette.mode}
                            rows={tableData.rows}
                            columns={
                                tableData.columns.length > 0
                                    ? tableData.columns
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
                            <ToolbarItem.Connection status={"connected"} />
                        </Toolbar>
                    </Box>
                </>
            )}
        </>
    )
}

type TablePageWrapperProps = {
    project: PM.Project
    tableList: PM.Table.List
    ssrHydratedTableData: SerializedTableData
}

const TablePageWrapper: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    return (
        <TableCtxProvider ssrHydratedTableData={props.ssrHydratedTableData}>
            <TablePage
                project={props.project}
                tableList={props.tableList}
                currentTable={props.ssrHydratedTableData.table}
            />
        </TableCtxProvider>
    )
}

export const getServerSideProps: GetServerSideProps<
    TablePageWrapperProps
> = async context => {
    const { req } = context
    const query = context.query as DynamicRouteQuery<
        typeof context.query,
        "tableId" | "projectId"
    >
    const projectId: PM.Project.ID = Number.parseInt(query.projectId)
    const tableId: PM.Table.ID = Number.parseInt(query.tableId)

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

    const project = (await API.get.projectsList()).find(
        proj => proj.projectId === projectId
    )
    if (project == null) return { notFound: true }
    const tableList = await API.get.tablesList(project.projectId)
    const data = await API.get.table(tableId)

    return {
        props: {
            project,
            tableList,
            ssrHydratedTableData: data,
        },
    }
}

export default TablePageWrapper
