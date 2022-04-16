import { DetailedViewModal } from "@datagrid/Detail Window/DetailedViewModal"
import LoadingSkeleton from "@datagrid/LoadingSkeleton/LoadingSkeleton"
import NoRowsRenderer from "@datagrid/NoRowsOverlay/NoRowsRenderer"
import { RowRenderer } from "@datagrid/renderers"
import Toolbar from "@datagrid/Toolbar/Toolbar"
import * as ToolbarItem from "@datagrid/Toolbar/ToolbarItems"
import { JtData, JtDescriptor } from "@intutable/join-tables/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { Box, CircularProgress, Typography, useTheme } from "@mui/material"
import { fetcher } from "api"
import { withSessionSsr } from "auth"
import Title from "components/Head/Title"
import Link from "components/Link"
import { TableNavigator } from "components/TableNavigator"
import {
    HeaderSearchFieldProvider,
    TableCtxProvider,
    useHeaderSearchField,
    useTableCtx,
} from "context"
import { useProjects } from "hooks/useProjects"
import { useTableData } from "hooks/useTableData"
import { useTables } from "hooks/useTables"
import { InferGetServerSidePropsType, NextPage } from "next"
import React, { useMemo, useState } from "react"
import DataGrid, { CalculatedColumn, RowsChangeData } from "react-data-grid"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { Row } from "types"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { rowKeyGetter } from "utils/rowKeyGetter"

type TablePageProps = {
    project: ProjectDescriptor
    table: JtDescriptor
    tableList: JtDescriptor[]
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
    projectId: ProjectDescriptor["id"]
    tableId: JtDescriptor["id"]
}

const Page: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ projectId, tableId }) => {
    // workaround until PM exposes the required method
    const { projects } = useProjects()
    const project = useMemo(
        () => (projects ? projects.find(p => p.id === projectId) : undefined),
        [projectId, projects]
    )
    const { tables } = useTables(project!, [projects])
    const table = useMemo(
        () => tables?.find(t => t.id === tableId),
        [tableId, tables]
    )

    if (projects == null || project == null || table == null || tables == null)
        return <CircularProgress />

    return (
        <TableCtxProvider table={table} project={project}>
            <HeaderSearchFieldProvider>
                <TablePage project={project} table={table} tableList={tables} />
            </HeaderSearchFieldProvider>
        </TableCtxProvider>
    )
}

export const getServerSideProps = withSessionSsr<PageProps>(async context => {
    const query = context.query as DynamicRouteQuery<
        typeof context.query,
        "tableId" | "projectId"
    >

    const user = context.req.session.user

    if (!user)
        return {
            notFound: true,
        }

    const projectId: ProjectDescriptor["id"] = Number.parseInt(query.projectId)
    const tableId: JtDescriptor["id"] = Number.parseInt(query.tableId)

    return {
        props: {
            user,
            projectId,
            tableId,
        },
    }
})

export default Page
