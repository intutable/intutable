import LoadingSkeleton from "@datagrid/LoadingSkeleton/LoadingSkeleton"
import NoRowsFallback from "@datagrid/NoRowsFallback/NoRowsFallback"
import { RowRenderer } from "@datagrid/renderers"
import Toolbar from "@datagrid/Toolbar/Toolbar"
import * as ToolbarItem from "@datagrid/Toolbar/ToolbarItems"
import { ViewDescriptor } from "@intutable/lazy-views/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { Grid, Box, Button, Typography, useTheme } from "@mui/material"
import { fetcher } from "api"
import { withSessionSsr } from "auth"
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
import { useBrowserInfo } from "hooks/useBrowserInfo"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import { useTables } from "hooks/useTables"
import { InferGetServerSidePropsType, NextPage } from "next"
import React, { useEffect, useState } from "react"
import DataGrid, { RowsChangeData } from "react-data-grid"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { Row, TableData, ViewData } from "types"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { rowKeyGetter } from "utils/rowKeyGetter"
import { withSSRCatch } from "utils/withSSRCatch"
import { useThemeToggler } from "pages/_app"
import { DetailedRowView } from "@datagrid/Detail Window/DetailedRowView"

const TablePage: React.FC = () => {
    const theme = useTheme()
    const { getTheme } = useThemeToggler()
    const { snackWarning, closeSnackbar } = useSnacki()
    const { isChrome } = useBrowserInfo()
    // warn if browser is not chrome
    useEffect(() => {
        if (isChrome === false)
            snackWarning(
                "Zzt. wird für Tabellen nur Google Chrome (für Browser) unterstützt!",
                {
                    persist: true,
                    action: key => (
                        <Button
                            onClick={() => closeSnackbar(key)}
                            sx={{ color: "white" }}
                        >
                            Ich verstehe
                        </Button>
                    ),
                    preventDuplicate: true,
                }
            )

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChrome])

    // #################### states ####################

    const { headerHeight } = useHeaderSearchField()
    const { project } = useAPI()
    const { data, error } = useView()
    const { tables: tableList } = useTables()
    const { getRowId, updateRow } = useRow()

    // views side panel
    const [viewNavOpen, setViewNavOpen] = useState<boolean>(false)

    // Column Selector
    const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
        () => new Set()
    )

    // Detailed View
    const [detailedViewOpen, setDetailedViewOpen] = useState<boolean>(true)
    const [detailedViewRow, setDetailedViewRow] = useState<Row | null>(null)

    // TODO: this should not be here and does not work as intended in this way
    const partialRowUpdate = async (
        rows: Row[],
        changeData: RowsChangeData<Row>
    ): Promise<void> => {
        const changedRow = rows[changeData.indexes[0]]
        const col = changeData.column

        await updateRow(col, getRowId(changedRow), changedRow[col.key])
    }

    const tableSize =
        viewNavOpen && detailedViewOpen
            ? 8
            : viewNavOpen != detailedViewOpen
            ? 10
            : 12

    if (tableList == null || data == null) return <LoadingSkeleton />

    return (
        <>
            <Title title={project!.name} />
            <Typography
                sx={{
                    mb: theme.spacing(4),
                    color: theme.palette.text.secondary,
                }}
            >
                Deine Tabellen in{" "}
                <Link
                    href={`/project/${project!.id}`}
                    muiLinkProps={{
                        underline: "hover",
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                    }}
                >
                    {project!.name}
                </Link>
            </Typography>

            <TableNavigator />

            {error ? (
                <span>Die Tabelle konnte nicht geladen Werden</span>
            ) : (
                <>
                    <Grid container spacing={2}>
                        {viewNavOpen && (
                            <Grid item xs={2}>
                                <ViewNavigator open={viewNavOpen} />
                            </Grid>
                        )}

                        <Grid item xs={tableSize}>
                            <Box>
                                <Toolbar position="top">
                                    <ToolbarItem.Views
                                        handleClick={() =>
                                            setViewNavOpen(prev => !prev)
                                        }
                                        open={viewNavOpen}
                                    />
                                    <ToolbarItem.AddCol />
                                    <ToolbarItem.AddLink />
                                    <ToolbarItem.AddRow />
                                    <ToolbarItem.EditFilters />
                                    <ToolbarItem.FileDownload
                                        getData={() => []}
                                    />
                                    <ToolbarItem.DetailView
                                        handleClick={() =>
                                            setDetailedViewOpen(prev => !prev)
                                        }
                                        open={detailedViewOpen}
                                    />
                                </Toolbar>

                                <DndProvider backend={HTML5Backend}>
                                    <DataGrid
                                        className={"rdg-" + getTheme()}
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
                                        onRowClick={(row, column) =>
                                            setDetailedViewRow(row)
                                        }
                                    />
                                </DndProvider>

                                <Toolbar position="bottom">
                                    <ToolbarItem.Connection
                                        status={"connected"}
                                    />
                                </Toolbar>
                            </Box>
                        </Grid>

                        {detailedViewOpen && (
                            <Grid item xs={2}>
                                <DetailedRowView
                                    row={detailedViewRow || undefined}
                                    open={detailedViewOpen}
                                />
                            </Grid>
                        )}
                    </Grid>
                </>
            )}
        </>
    )
}

type PageProps = {
    project: ProjectDescriptor
    /**
     * In order to allow links/joins, tables are actually implemented using
     * views. The user-facing views (filtering, hiding columns, etc.) are
     * implemented as views on views, so be careful not to get confused.
     */
    table: ViewDescriptor
    tableList: ViewDescriptor[]
    /**
     * The current filter view, which selects from the table view
     * {@link table}
     */
    view: ViewDescriptor
    viewList: ViewDescriptor[]
    // fallback: {
    //     [cacheKey: string]: ViewData
    // }
}

const Page: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ project, table, view }) => {
    return (
        <APIContextProvider project={project} table={table} view={view}>
            <HeaderSearchFieldProvider>
                <TablePage />
            </HeaderSearchFieldProvider>
        </APIContextProvider>
    )
}

export const getServerSideProps = withSSRCatch(
    withSessionSsr<PageProps>(async context => {
        const query = context.query as DynamicRouteQuery<
            typeof context.query,
            "tableId" | "projectId"
        >

        const user = context.req.session.user

        if (user == null || user.isLoggedIn === false)
            return {
                notFound: true,
            }

        const projectId: ProjectDescriptor["id"] = Number.parseInt(
            query.projectId
        )
        const tableId: ViewDescriptor["id"] = Number.parseInt(query.tableId)

        if (isNaN(projectId) || isNaN(tableId))
            return {
                notFound: true,
            }

        // workaround until PM exposes a "get project" method
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
        const tableData = await fetcher<TableData.Serialized>({
            url: `/api/table/${tableId}`,
            method: "GET",
            headers: context.req.headers as HeadersInit,
        })
        const viewList = await fetcher<ViewDescriptor[]>({
            url: `/api/views/${tableId}`,
            method: "GET",
            headers: context.req.headers as HeadersInit,
        })

        if (viewList.length === 0) {
            return { notFound: true }
        }
        const view: ViewDescriptor = viewList[0]

        const data = await fetcher<ViewData.Serialized>({
            url: `/api/view/${view.id}`,
            method: "GET",
            headers: context.req.headers as HeadersInit,
        })

        return {
            props: {
                project,
                table: tableData.metadata.descriptor,
                tableList,
                view: data.descriptor,
                viewList,
                // fallback: {
                //     [unstable_serialize({
                //         url: `/api/table/${tableId}`,
                //         method: "GET",
                //     })]: data,
                // },
            },
        }
    })
)

export default Page
