import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import React, { useMemo, useState } from "react"
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

import { Auth, withSessionSsr } from "auth"
import {
    AUTH_COOKIE_KEY,
    HeaderSearchFieldProvider,
    TableCtxProvider,
    useHeaderSearchField,
    useTableCtx,
} from "context"
import Title from "components/Head/Title"
import Link from "components/Link"
import { TableNavigator } from "components/TableNavigator"
import type { Row } from "types"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { rowKeyGetter } from "utils/rowKeyGetter"
import { fetcher } from "api"
import { ProtectedUserPage } from "utils/ProtectedUserPage"
import { useProjects } from "hooks/useProjects"
import { useTables } from "hooks/useTables"

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

    const { tables } = useTables(project!, [projects, projects])

    return <>Hallo</>

    // const data = await fetcher<JtData>(
    //     `/api/table/${tableId}`,
    //     user,
    //     undefined,
    //     "GET"
    // )

    // return (
    //     <TableCtxProvider table={table} project={project}>
    //         <HeaderSearchFieldProvider>
    //             <TablePage
    //                 project={project}
    //                 table={table}
    //                 tableList={tableList}
    //             />
    //         </HeaderSearchFieldProvider>
    //     </TableCtxProvider>
    // )
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
