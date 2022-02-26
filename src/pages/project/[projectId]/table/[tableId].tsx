import { DetailedViewModal } from "@datagrid/Detail View/DetailedViewModal"
import LoadingSkeleton from "@datagrid/LoadingSkeleton/LoadingSkeleton"
import NoRowsRenderer from "@datagrid/NoRowsOverlay/NoRowsRenderer"
import { RowRenderer } from "@datagrid/RowRenderer"
import Toolbar from "@datagrid/Toolbar/Toolbar"
import * as ToolbarItem from "@datagrid/Toolbar/ToolbarItems"
import { Box, Typography, useTheme } from "@mui/material"
import { makeAPI, Routes } from "api"
import { Auth } from "auth"
import Title from "components/Head/Title"
import Link from "components/Link"
import { TableNavigator } from "components/TableNavigator"
import { AUTH_COOKIE_KEY, TableCtxProvider, useTableCtx } from "context"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import React, { useEffect, useState } from "react"
import DataGrid, { CalculatedColumn } from "react-data-grid"
import { SWRConfig, unstable_serialize } from "swr"
import type { PMTypes as PM, Row } from "types"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { rowKeyGetter } from "utils/rowKeyGetter"

type TablePageProps = {
    project: PM.Project
    table: PM.Table
    tableList: PM.Table[]
}
const TablePage: React.FC<TablePageProps> = props => {
    const theme = useTheme()

    // #################### states ####################

    const [detailedViewOpen, setDetailedViewOpen] = useState<{
        row: Row
        column: CalculatedColumn<Row>
    } | null>(null)

    const { data: table, error, partialRowUpdate } = useTableCtx()

    useEffect(() => {
        console.log(21)
        console.log(table)
    }, [table])

    return (
        <>
            <Title title={props.project.projectName} />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                <Link href={`/projects`}>{props.project.projectName}</Link>{" "}
                {"> "}
                <Link href={`/project/${props.project.projectId}`}>
                    {props.table.tableName}
                </Link>
            </Typography>

            {error ? (
                error.message
            ) : table == null ? (
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
                        currentTable={props.table}
                        tableList={props.tableList}
                    />
                    <Box>
                        <Toolbar position="top">
                            <ToolbarItem.AddCol />
                            <ToolbarItem.AddRow />
                            <ToolbarItem.FileDownload getData={() => []} />
                        </Toolbar>
                        <DataGrid
                            className={"rdg-" + theme.palette.mode}
                            rows={table.rows}
                            columns={table.columns}
                            noRowsFallback={<NoRowsRenderer />}
                            rowKeyGetter={rowKeyGetter}
                            defaultColumnOptions={{
                                sortable: true,
                                resizable: true,
                            }}
                            onRowsChange={partialRowUpdate}
                            onRowDoubleClick={(row, column) => {
                                setDetailedViewOpen({ row, column })
                            }}
                            rowRenderer={RowRenderer}
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

type Page = {
    project: PM.Project
    table: PM.Table
    tableList: PM.Table[]
    // fallback: SerializedTableData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fallback: any // TODO: remove this any
}
const Page: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ project, table, tableList, fallback }) => {
    console.log(fallback)
    return (
        <SWRConfig value={{ fallback }}>
            <TableCtxProvider table={table} project={project}>
                <TablePage
                    project={project}
                    table={table}
                    tableList={tableList}
                />
            </TableCtxProvider>
        </SWRConfig>
    )
}

export const getServerSideProps: GetServerSideProps<Page> = async context => {
    const { req } = context
    const query = context.query as DynamicRouteQuery<
        typeof context.query,
        "tableId" | "projectId"
    >
    const projectId: PM.Project.ID = Number.parseInt(query.projectId)
    const tableId: PM.Table.ID = Number.parseInt(query.tableId)

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

    const project = (await API.get.projectList()).find(
        (proj: PM.Project) => proj.projectId === projectId
    )
    if (project == null) return { notFound: true }
    const tableList = await API.get.tableList(project.projectId)
    const data = await API.get.table(tableId)

    return {
        props: {
            project,
            table: data.table,
            tableList,
            fallback: {
                [unstable_serialize([
                    Routes.get.table,
                    user,
                    { tableId: tableId },
                ])]: data, // TODO: where to deserialize?
            },
        },
    }
}

export default Page
