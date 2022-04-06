import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import React, { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import DataGrid, { CalculatedColumn, RowsChangeData } from "react-data-grid"
import { DetailedViewModal } from "@datagrid/Detail Window/DetailedViewModal"
import LoadingSkeleton from "@datagrid/LoadingSkeleton/LoadingSkeleton"
import NoRowsRenderer from "@datagrid/NoRowsOverlay/NoRowsRenderer"
import { RowRenderer } from "@datagrid/renderers"
import Toolbar from "@datagrid/Toolbar/Toolbar"
import * as ToolbarItem from "@datagrid/Toolbar/ToolbarItems"
import { Box, Typography, useTheme } from "@mui/material"
import { SWRConfig, unstable_serialize } from "swr"

import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { JtDescriptor, JtData } from "@intutable/join-tables/dist/types"

import { Auth } from "auth"
import { AUTH_COOKIE_KEY, TableCtxProvider, useTableCtx } from "context"
import Title from "components/Head/Title"
import Link from "components/Link"
import { TableNavigator } from "components/TableNavigator"
import type { Row } from "types"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { rowKeyGetter } from "utils/rowKeyGetter"
import { fetchWithUser } from "api"

type TablePageProps = {
    project: ProjectDescriptor
    table: JtDescriptor
    tableList: JtDescriptor[]
}
const TablePage: React.FC<TablePageProps> = props => {
    const theme = useTheme()

    // #################### states ####################

    const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
        () => new Set()
    )

    const [detailedViewOpen, setDetailedViewOpen] = useState<{
        row: Row
        column: CalculatedColumn<Row>
    } | null>(null)

    const { data, error, updateRow, utils } = useTableCtx()

    const partialRowUpdate = async (
        rows: Row[],
        changeData: RowsChangeData<Row>
    ): Promise<void> => {
        const changedRow = rows[changeData.indexes[0]]
        const key = changeData.column.key

        await updateRow(key, utils.getRowId(data, changedRow), changedRow[key])
    }

    return (
        <>
            <Title title={props.project.name} />
            <Typography
                sx={{
                    mb: theme.spacing(4),
                    color: theme.palette.text.secondary,
                }}
            >
                Deine Tabellen in{" "}
                <Link
                    href={`/project/${props.project.id}`}
                    muiLinkProps={{
                        underline: "hover",
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                    }}
                >
                    {props.project.name}
                </Link>
            </Typography>

            {error ? (
                error.message
            ) : data == null ? (
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
                            <ToolbarItem.AddLink />
                            <ToolbarItem.AddRow />
                            <ToolbarItem.FileDownload getData={() => []} />
                        </Toolbar>
                        <DndProvider backend={HTML5Backend}>
                            <DataGrid
                                className={"rdg-" + theme.palette.mode}
                                rows={data.rows}
                                columns={data.columns}
                                noRowsFallback={<NoRowsRenderer />}
                                rowKeyGetter={rowKeyGetter}
                                defaultColumnOptions={{
                                    sortable: true,
                                    resizable: true,
                                }}
                                selectedRows={selectedRows}
                                onSelectedRowsChange={setSelectedRows}
                                onRowsChange={partialRowUpdate}
                                rowRenderer={RowRenderer}
                            />
                        </DndProvider>
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
    project: ProjectDescriptor
    table: JtDescriptor
    tableList: JtDescriptor[]
    // fallback: SerializedTableData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fallback: any // TODO: remove this any
}
const Page: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ project, table, tableList, fallback }) => {
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
    const projectId: ProjectDescriptor["id"] = Number.parseInt(query.projectId)
    const tableId: JtDescriptor["id"] = Number.parseInt(query.tableId)

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

    // workaround until PM exposes the required method
    const projects = await fetchWithUser<ProjectDescriptor[]>(
        `/api/projects/${user.id}`,
        user,
        undefined,
        "GET"
    )
    const project = projects.find(p => p.id === projectId)

    if (project == null) return { notFound: true }

    const tableList = await fetchWithUser<JtDescriptor[]>(
        `/api/tables/${projectId}`,
        user,
        undefined,
        "GET"
    )

    const data = await fetchWithUser<JtData>(
        `/api/table/${tableId}`,
        user,
        undefined,
        "GET"
    )

    return {
        props: {
            project,
            table: data.descriptor,
            tableList,
            fallback: {
                [unstable_serialize([
                    `/api/table/${tableId}`,
                    user,
                    undefined,
                    "GET",
                ])]: data,
            },
        },
    }
}

export default Page
