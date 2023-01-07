import { SelectColumn } from "@datagrid/Cells/SelectColumn"
import LoadingSkeleton from "@datagrid/LoadingSkeleton"
import { RowRenderer } from "@datagrid/renderers"
import RowMask from "@datagrid/RowMask/RowMask"
import Toolbar from "@datagrid/Toolbar/Toolbar"
import * as ToolbarItem from "@datagrid/Toolbar/ToolbarItems"
import { ViewDescriptor } from "@shared/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { Box, Button, Grid, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { fetcher } from "api"
import { withSessionSsr } from "auth"
import Link from "components/Link"
import MetaTitle from "components/MetaTitle"
import { TableNavigator } from "components/TableNavigator"
import { ViewNavigator } from "components/ViewNavigator"
import {
    APIContextProvider,
    HeaderSearchFieldProvider,
    useAPI,
    useHeaderSearchField,
} from "context"
import { RowMaskProvider } from "context/RowMaskContext"
import { SelectedRowsContextProvider, useSelectedRows } from "context/SelectedRowsContext"
import { useBrowserInfo } from "hooks/useBrowserInfo"
import { useCellNavigation } from "hooks/useCellNavigation"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useTables } from "hooks/useTables"
import { useView } from "hooks/useView"
import { InferGetServerSidePropsType, NextPage } from "next"
import { useThemeToggler } from "pages/_app"
import React, { useEffect, useState } from "react"
import DataGrid, { RowsChangeData } from "react-data-grid"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { Row, TableData, ViewData } from "types"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { ClipboardUtil } from "utils/ClipboardUtil"
import { rowKeyGetter } from "utils/rowKeyGetter"
import { withSSRCatch } from "utils/withSSRCatch"

const TablePage: React.FC = () => {
    const theme = useTheme()
    const { getTheme } = useThemeToggler()
    const { snackWarning, closeSnackbar, snackError, snack } = useSnacki()
    const { isChrome } = useBrowserInfo()
    const { selectedRows, setSelectedRows } = useSelectedRows()
    const { cellNavigationMode } = useCellNavigation()

    // warn if browser is not chrome
    useEffect(() => {
        if (isChrome === false)
            snackWarning("Zzt. wird für Tabellen nur Google Chrome (für Browser) unterstützt!", {
                persist: true,
                action: key => (
                    <Button onClick={() => closeSnackbar(key)} sx={{ color: "white" }}>
                        Ich verstehe
                    </Button>
                ),
                preventDuplicate: true,
            })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChrome])

    // #################### states ####################

    const { headerHeight } = useHeaderSearchField()
    const { project } = useAPI()
    const { data, error } = useView()
    const { tables: tableList } = useTables()
    const { updateRow } = useRow()

    // views side panel
    const [viewNavOpen, setViewNavOpen] = useState<boolean>(false)

    // TODO: this should not be here and does not work as intended in this way
    const partialRowUpdate = async (
        rows: Row[],
        changeData: RowsChangeData<Row>
    ): Promise<void> => {
        const changedRow = rows[changeData.indexes[0]]
        const col = changeData.column
        const update = changedRow[col.key]
        await updateRow(col, changedRow, update)
    }

    const tableSize = {
        xs: viewNavOpen ? 10 : 12,
    }
    if (tableList == null || data == null) return <LoadingSkeleton />

    const clipboardUtil = new ClipboardUtil(data!.columns)

    return (
        <>
            <MetaTitle title={project!.name} />
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
                <Grid container spacing={2}>
                    {viewNavOpen && (
                        <Grid item xs={2}>
                            <ViewNavigator open={viewNavOpen} />
                        </Grid>
                    )}

                    <Grid item xs={tableSize.xs}>
                        <Box>
                            <Toolbar position="top">
                                <ToolbarItem.Views
                                    handleClick={() => setViewNavOpen(prev => !prev)}
                                    open={viewNavOpen}
                                />
                                <ToolbarItem.AddCol />
                                <ToolbarItem.AddLink />
                                <ToolbarItem.AddRow />
                                <ToolbarItem.EditFilters />
                                <ToolbarItem.ExportView />
                                <ToolbarItem.HiddenColumns />
                            </Toolbar>

                            <DndProvider backend={HTML5Backend}>
                                <DataGrid
                                    className={"rdg-" + getTheme() + " fill-grid"}
                                    rows={data.rows}
                                    columns={[
                                        SelectColumn,
                                        ...data.columns.filter(column => column.hidden !== true),
                                    ]}
                                    components={{
                                        // noRowsFallback: <NoRowsFallback />, // BUG: does not work with columns but no rows bc css
                                        rowRenderer: RowRenderer,
                                        // checkboxFormatter: // TODO: adjust
                                        // sortIcon: // TODO: adjust
                                    }}
                                    rowKeyGetter={rowKeyGetter}
                                    onCopy={event =>
                                        clipboardUtil.handleOnCopy(event, error => {
                                            error ? snackError(error) : snack("1 Zelle kopiert")
                                        })
                                    }
                                    // onFill={e =>
                                    //     clipboardUtil.handleOnFill(e)
                                    // }
                                    onPaste={e =>
                                        clipboardUtil.handleOnPaste(e, error => {
                                            error ? snackError(error) : snack("1 Zelle eingefügt")
                                        })
                                    }
                                    selectedRows={selectedRows}
                                    onSelectedRowsChange={setSelectedRows}
                                    onRowsChange={partialRowUpdate}
                                    headerRowHeight={headerHeight}
                                    // onRowClick={(row, column) =>
                                    //     setRowMaskState({
                                    //         mode: "edit",
                                    //         row,
                                    //         column,
                                    //     })
                                    // }
                                    cellNavigationMode={cellNavigationMode}
                                />
                            </DndProvider>

                            <Toolbar position="bottom">
                                <ToolbarItem.Connection status="connected" />
                            </Toolbar>
                        </Box>
                    </Grid>

                    <RowMask />
                </Grid>
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

const Page: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
    project,
    table,
    view,
}) => {
    return (
        <APIContextProvider project={project} table={table} view={view}>
            <SelectedRowsContextProvider>
                <HeaderSearchFieldProvider>
                    <RowMaskProvider>
                        <TablePage />
                    </RowMaskProvider>
                </HeaderSearchFieldProvider>
            </SelectedRowsContextProvider>
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

        const projectId: ProjectDescriptor["id"] = Number.parseInt(query.projectId)
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

        const viewData = await fetcher<ViewData.Serialized>({
            url: `/api/view/${view.id}`,
            method: "GET",
            headers: context.req.headers as HeadersInit,
        })

        return {
            props: {
                project,
                table: tableData.descriptor,
                tableList,
                view: viewData.descriptor,
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
