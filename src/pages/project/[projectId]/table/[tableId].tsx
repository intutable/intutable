import { DetailedViewModal } from "@datagrid/Detail Window/DetailedViewModal"
import LoadingSkeleton from "@datagrid/LoadingSkeleton/LoadingSkeleton"
import NoRowsRenderer from "@datagrid/NoRowsOverlay/NoRowsRenderer"
import { RowRenderer } from "@datagrid/renderers"
import Toolbar from "@datagrid/Toolbar/Toolbar"
import * as ToolbarItem from "@datagrid/Toolbar/ToolbarItems"
import { ViewDescriptor } from "@intutable/lazy-views"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { Box, Typography, useTheme } from "@mui/material"
import { fetcher } from "api"
import { withSessionSsr } from "auth"
import Title from "components/Head/Title"
import Link from "components/Link"
import { TableNavigator } from "components/TableNavigator"
import {
    APIContextProvider,
    HeaderSearchFieldProvider,
    useHeaderSearchField,
} from "context"
import { useRow } from "hooks/useRow"
import { useTable } from "hooks/useTable"
import { InferGetServerSidePropsType, NextPage } from "next"
import React, { useState } from "react"
import DataGrid, { CalculatedColumn, RowsChangeData } from "react-data-grid"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { Row, TableData } from "types"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { rowKeyGetter } from "utils/rowKeyGetter"

type TablePageProps = {
    project: ProjectDescriptor
    table: ViewDescriptor
    tableList: ViewDescriptor[]
}
const TablePage: React.FC<TablePageProps> = props => {
    const theme = useTheme()

    // #################### states ####################

    const { headerHeight } = useHeaderSearchField()

    const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
        () => new Set()
    )

    const [detailedViewOpen, setDetailedViewOpen] = useState<{
        row: Row
        column: CalculatedColumn<Row>
    } | null>(null)

    const { data, error } = useTable()
    const { updateRow, getRowId } = useRow()

    // TODO: this should not be here and does not work as intended in this way
    const partialRowUpdate = async (
        rows: Row[],
        changeData: RowsChangeData<Row>
    ): Promise<void> => {
        const changedRow = rows[changeData.indexes[0]]
        const col = changeData.column

        await updateRow(col, getRowId(data, changedRow), changedRow[col.key])
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
                <> Error: {error}</>
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
                                components={{
                                    noRowsFallback: <NoRowsRenderer />,
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
                            <ToolbarItem.Connection status={"connected"} />
                        </Toolbar>
                    </Box>
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
> = ({ project, table, tableList }) => (
    <APIContextProvider project={project} table={table}>
        <HeaderSearchFieldProvider>
            <TablePage project={project} table={table} tableList={tableList} />
        </HeaderSearchFieldProvider>
    </APIContextProvider>
)

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
