import { DetailedViewModal } from "@datagrid/Detail Window/DetailedViewModal"
import LoadingSkeleton from "@datagrid/LoadingSkeleton/LoadingSkeleton"
import NoRowsFallback from "@datagrid/NoRowsFallback/NoRowsFallback"
import { RowRenderer } from "@datagrid/renderers"
import Toolbar from "@datagrid/Toolbar/Toolbar"
import * as ToolbarItem from "@datagrid/Toolbar/ToolbarItems"
import { ViewDescriptor } from "@intutable/lazy-views"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { Grid, Box, Typography, useTheme } from "@mui/material"
import { fetcher } from "api"
import { withSessionSsr } from "auth"
import { ErrorBoundary } from "components/ErrorBoundary"
import Title from "components/Head/Title"
import Link from "components/Link"
import { TableNavigator } from "components/TableNavigator"
import { ViewNavigator } from "components/ViewNavigator"
import {
    APIContextProvider,
    HeaderSearchFieldProvider,
    useAPI,
    useHeaderSearchField,
} from "context"
import { getRowId, useRow } from "hooks/useRow"
import { useTable } from "hooks/useTable"
import { useTables } from "hooks/useTables"
import { InferGetServerSidePropsType, NextPage } from "next"
import React, { useState } from "react"
import DataGrid, { CalculatedColumn, RowsChangeData } from "react-data-grid"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { Row, TableData } from "types"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { rowKeyGetter } from "utils/rowKeyGetter"

const TablePage: React.FC = () => {
    const theme = useTheme()

    // #################### states ####################

    const { headerHeight } = useHeaderSearchField()
    const { project, table } = useAPI()
    const { data, error } = useTable()
    const { tables: tableList } = useTables(project)
    const { updateRow } = useRow()

    // views side panel
    const [viewsOpen, setViewsOpen] = useState<boolean>(true)

    // Column Selector
    const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
        () => new Set()
    )

    // Detailed View
    const [detailedViewOpen, setDetailedViewOpen] = useState<{
        row: Row
        column: CalculatedColumn<Row>
    } | null>(null)

    // TODO: this should not be here and does not work as intended in this way
    const partialRowUpdate = async (
        rows: Row[],
        changeData: RowsChangeData<Row>
    ): Promise<void> => {
        const changedRow = rows[changeData.indexes[0]]
        const col = changeData.column

        await updateRow(col, getRowId(data, changedRow), changedRow[col.key])
    }

    if (project == null || table == null || tableList == null)
        return <LoadingSkeleton />

    return (
        <>
            <Title title={project.name} />
            <Typography
                sx={{
                    mb: theme.spacing(4),
                    color: theme.palette.text.secondary,
                }}
            >
                Deine Tabellen in{" "}
                <Link
                    href={`/project/${project.id}`}
                    muiLinkProps={{
                        underline: "hover",
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                    }}
                >
                    {project.name}
                </Link>
            </Typography>

            {data == null ? (
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

                    <ErrorBoundary fallback={null}>
                        <TableNavigator />
                    </ErrorBoundary>

                    {error ? (
                        <>Error</>
                    ) : (
                        <Box>
                            <ErrorBoundary
                                fallback={
                                    <span>
                                        Die Tabelle konnte nicht geladen werden.
                                    </span>
                                }
                            >
                                <Toolbar position="top">
                                    <ToolbarItem.Views
                                        handleClick={_ =>
                                            setViewsOpen(!viewsOpen)
                                        }
                                    />
                                    <ToolbarItem.AddCol />
                                    <ToolbarItem.AddLink />
                                    <ToolbarItem.AddRow />
                                    <ToolbarItem.FileDownload
                                        getData={() => []}
                                    />
                                </Toolbar>

                                <ErrorBoundary
                                    fallback={
                                        <span>
                                            Die Views konnten nicht angezeigt
                                            werden.
                                        </span>
                                    }
                                >
                                    {viewsOpen && (
                                        <ViewNavigator
                                            sx={{ maxWidth: "12%" }}
                                        />
                                    )}
                                </ErrorBoundary>

                                <DndProvider backend={HTML5Backend}>
                                    <DataGrid
                                        className={"rdg-" + theme.palette.mode}
                                        rows={data.rows}
                                        columns={data.columns}
                                        components={{
                                            noRowsFallback: <NoRowsFallback />,
                                            rowRenderer: RowRenderer,
                                            // checkboxFormatter: // TODO: adjust
                                            // sortIcon: // TODO: adjust
                                        }}
                                        rowKeyGetter={rowKeyGetter}
                                        defaultColumnOptions={{
                                            sortable: true,
                                            resizable: true,
                                            // formatter: // TODO: adjust
                                        }}
                                        selectedRows={selectedRows}
                                        onSelectedRowsChange={setSelectedRows}
                                        onRowsChange={partialRowUpdate}
                                        headerRowHeight={headerHeight}
                                    />
                                </DndProvider>

                                <Toolbar position="bottom">
                                    <ToolbarItem.Connection
                                        status={"connected"}
                                    />
                                </Toolbar>
                            </ErrorBoundary>
                        </Box>
                    )}
                </>
            )}
        </>
    )
}

type PageProps = {
    project: ProjectDescriptor
    table: ViewDescriptor
    tableList: ViewDescriptor[]
    // fallback: {
    //     [cacheKey: string]: ViewData
    // }
}

const Page: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ project, table }) => {
    return (
        <APIContextProvider project={project} table={table}>
            <HeaderSearchFieldProvider>
                <TablePage />
            </HeaderSearchFieldProvider>
        </APIContextProvider>
    )
}

export const getServerSideProps = withSessionSsr<PageProps>(async context => {
    const query = context.query as DynamicRouteQuery<
        typeof context.query,
        "tableId" | "projectId"
    >

    const user = context.req.session.user

    if (user == null || user.isLoggedIn === false)
        return {
            notFound: true,
        }

    const projectId: ProjectDescriptor["id"] = Number.parseInt(query.projectId)
    const tableId: ViewDescriptor["id"] = Number.parseInt(query.tableId)

    if (isNaN(projectId) || isNaN(tableId))
        return {
            notFound: true,
        }

    // workaround until PM exposes the required method
    const projects = await fetcher<ProjectDescriptor[]>({
        url: `/api/projects`,
        method: "GET",
        headers: context.req.headers as HeadersInit,
    })

    const project = projects.find(p => p.id === projectId)

    if (project == null) return { notFound: true }

    const tableList = await fetcher<ViewDescriptor[]>({
        url: `/api/tables/${projectId}`,
        method: "GET",
        headers: context.req.headers as HeadersInit,
    })

    const data = await fetcher<TableData.Serialized>({
        url: `/api/table/${tableId}`,
        method: "GET",
        headers: context.req.headers as HeadersInit,
    })

    return {
        props: {
            project,
            table: data.metadata.descriptor,
            tableList,
            // fallback: {
            //     [unstable_serialize({
            //         url: `/api/table/${tableId}`,
            //         method: "GET",
            //     })]: data,
            // },
        },
    }
})

export default Page
