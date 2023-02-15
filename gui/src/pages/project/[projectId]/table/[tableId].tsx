import { SelectColumn } from "@datagrid/Cells/SelectColumn"
import LoadingSkeleton from "@datagrid/LoadingSkeleton"
import { RowRenderer } from "@datagrid/renderers"
import RowMaskContainer from "@datagrid/RowMask/Container"
import Toolbar from "@datagrid/Toolbar/Toolbar"
import * as ToolbarItem from "@datagrid/Toolbar/ToolbarItems"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import { Box, Grid, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { InputMask } from "@shared/input-masks/types"
import { TableDescriptor, ViewDescriptor } from "@shared/types"
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
import { ConstraintsProvider } from "context/ConstraintsContext"
import { RowMaskProvider } from "context/RowMaskContext"
import { SelectedRowsContextProvider, useSelectedRows } from "context/SelectedRowsContext"
import { useCellNavigation } from "hooks/useCellNavigation"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useTables } from "hooks/useTables"
import { useView } from "hooks/useView"
import { InferGetServerSidePropsType, NextPage } from "next"
import { useThemeToggler } from "pages/_app"
import React, { useState } from "react"
import DataGrid, { RowsChangeData } from "react-data-grid"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import type { Row, TableData, ViewData } from "types"
import { DynamicRouteQuery } from "types/DynamicRouteQuery"
import { ClipboardUtil } from "utils/ClipboardUtil"
import { PageAction, PageActionUtil } from "utils/PageAction"
import { rowKeyGetter } from "utils/rowKeyGetter"
import { withSSRCatch } from "utils/withSSRCatch"

const TablePage: React.FC = () => {
    const theme = useTheme()
    const { getTheme } = useThemeToggler()
    const { snackError, snack } = useSnacki()

    const { selectedRows, setSelectedRows } = useSelectedRows()
    const { cellNavigationMode } = useCellNavigation()
    // const { createPendingRow } = usePendingRow()

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

                    <RowMaskContainer />
                </Grid>
            )}
        </>
    )
}

type PageProps = {
    project: ProjectDescriptor
    table: TableDescriptor
    tableList: TableDescriptor[]
    view: ViewDescriptor
    actions: PageAction[]
    viewList: ViewDescriptor[]
    inputMask?: InputMask["id"]
    openRow?: Row["_id"]
    // fallback: {
    //     [cacheKey: string]: ViewData
    // }
}

const Page: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (
    props: PageProps
) => {
    return (
        <APIContextProvider project={props.project} table={props.table} view={props.view}>
            <SelectedRowsContextProvider>
                <HeaderSearchFieldProvider>
                    <RowMaskProvider
                        initialRowMaskState={
                            props.openRow
                                ? { mode: "edit", row: { _id: props.openRow } }
                                : undefined
                        }
                        initialAppliedInputMask={props.inputMask}
                    >
                        {/* <ConstraintsProvider> */}
                        <TablePage />
                        {/* </ConstraintsProvider> */}
                    </RowMaskProvider>
                </HeaderSearchFieldProvider>
            </SelectedRowsContextProvider>
        </APIContextProvider>
    )
}

export const getServerSideProps = withSSRCatch(
    withSessionSsr<PageProps>(async context => {
        const queryParameters = context.query as DynamicRouteQuery<
            typeof context.query,
            "tableId" | "projectId"
        >

        const pageActionUtil = PageActionUtil.fromQuery(context.query)
        const inputMask = pageActionUtil.use<string>("selectInputMask")?.payload ?? null
        const openRow = pageActionUtil.use<number>("openRow")?.payload ?? null

        // TODO: check if the action 'createRow' would be executed again, if the user would reload the page
        // if so, push the action into 'completedActions' and use the uid to guarantee that the same action
        // does not get executed twice
        // if that does not work – save it to a session storage and do not execute actions twice

        // TODO: maybe remove the url parameter `newRecord` once executed
        // https://nextjs.org/docs/api-reference/next/router#routerpush
        // router.push({ shallow: boolean }) <-- this could help ?
        // if true, it wont re-run ssgr/ssr methods again
        // i think this is what we want: actions build from the url wouldn't be dispatches twice

        // TODO: if setting an inputMask, it must be guaranteed that it matches especially its source (but also / project / table / view)
        const createRow = pageActionUtil.use<number>("createRow") // TODO: show a dialog that asks "Neuen Eintrag erstellen" and then opens it

        const user = context.req.session.user

        if (user == null || user.isLoggedIn === false)
            return {
                notFound: true,
            }

        const projectId: ProjectDescriptor["id"] = Number.parseInt(queryParameters.projectId)
        const tableId: ViewDescriptor["id"] = Number.parseInt(queryParameters.tableId)

        if (isNaN(projectId) || isNaN(tableId))
            return {
                notFound: true,
            }

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

        const selectView = pageActionUtil.use<ViewDescriptor["id"]>("selectView")
        const view =
            selectView != null ? viewList.find(view => view.id === selectView.payload) : viewList[0]
        if (view == null) throw new Error("Could not find view")

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
                actions: pageActionUtil.actions,
                inputMask,
                openRow,
            } as PageProps,
        }
    })
)

export default Page
