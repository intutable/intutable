import { SelectColumn } from "@datagrid/Cells/SelectColumn"
import LoadingSkeleton from "@datagrid/LoadingSkeleton"
import { RowRenderer } from "@datagrid/renderers"
import RowMaskContainer from "@datagrid/RowMask/Container"
import Toolbar from "@datagrid/Toolbar/Toolbar"
import * as ToolbarItem from "@datagrid/Toolbar/ToolbarItems"
import { ViewDescriptor } from "@intutable/lazy-views"

import { Box, Grid, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { InputMask } from "@shared/input-masks/types"
import { fetcher } from "api"
import { withSessionSsr } from "auth"
import Link from "components/Link"
import MetaTitle from "components/MetaTitle"
import { TableNavigator } from "components/TableNavigator"
import { ViewNavigator } from "components/ViewNavigator"
import { HeaderSearchFieldProvider, useHeaderSearchField } from "context"
import { LockedColumnsProvider, useLockedColumns } from "context/LockedColumnsContext"

import { RowMaskProvider } from "context/RowMaskContext"
import { SelectedRowsContextProvider, useSelectedRows } from "context/SelectedRowsContext"
import { APIQueries, parseQuery, useAPI } from "hooks/useAPI"
import { useCellNavigation } from "hooks/useCellNavigation"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useTables } from "hooks/useTables"
import { useView } from "hooks/useView"
import { InferGetServerSidePropsType, NextPage } from "next"
import React, { useState } from "react"
import DataGrid from "react-data-grid"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Row } from "types"
import { ClipboardUtil } from "utils/ClipboardUtil"
import { PageActionUtil } from "utils/PageAction"
import { rowKeyGetter } from "utils/rowKeyGetter"
import { withSSRCatch } from "utils/withSSRCatch"

const TablePage: React.FC = () => {
    const theme = useTheme()
    const { snackError, snack } = useSnacki()

    const { mergeWithLocked } = useLockedColumns()

    const { selectedRows, setSelectedRows } = useSelectedRows()
    const { cellNavigationMode } = useCellNavigation()
    // const { createPendingRow } = usePendingRow()

    // #################### states ####################

    const { headerHeight } = useHeaderSearchField()
    const { project } = useAPI()
    const { data, error } = useView()
    const { tables: tableList } = useTables()
    const { updateRow_RDG } = useRow()

    // views side panel
    const [viewNavOpen, setViewNavOpen] = useState<boolean>(false)

    const tableSize = {
        xs: viewNavOpen ? 10 : 12,
    }

    if (error) return <span>Die Tabelle konnte nicht geladen Werden</span>
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

                        {/* <DndProvider backend={HTML5Backend}> */}
                        <DataGrid
                            className={"rdg-" + theme.palette.mode + " fill-grid"}
                            rows={data.rows}
                            columns={mergeWithLocked([
                                SelectColumn,
                                ...data.columns.filter(column => column.hidden !== true),
                            ])}
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
                            onRowsChange={updateRow_RDG}
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
                        {/* </DndProvider> */}

                        <Toolbar position="bottom">
                            <ToolbarItem.Connection status="connected" />
                        </Toolbar>
                    </Box>

                    <RowMaskContainer />
                </Grid>
            </Grid>
        </>
    )
}

type PageProps = {
    // project: ProjectDescriptor
    // table: TableDescriptor
    // tableList: TableDescriptor[]
    // view: ViewDescriptor
    // actions: PageAction[]
    // viewList: ViewDescriptor[]
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
        <SelectedRowsContextProvider>
            <HeaderSearchFieldProvider>
                <RowMaskProvider
                    row={props.openRow ? { _id: props.openRow } : null}
                    inputMask={props.inputMask ? { id: props.inputMask } : null}
                >
                    <LockedColumnsProvider>
                        <TablePage />
                    </LockedColumnsProvider>
                </RowMaskProvider>
            </HeaderSearchFieldProvider>
        </SelectedRowsContextProvider>
    )
}

export const getServerSideProps = withSSRCatch(
    withSessionSsr(async context => {
        const user = context.req.session.user
        if (user == null || user.isLoggedIn === false)
            return {
                notFound: true,
            }

        const { projectId, tableId, viewId } = parseQuery<APIQueries>(context.query, [
            "projectId",
            "tableId",
            "viewId",
        ])
        if (projectId == null || tableId == null)
            return {
                notFound: true,
            }

        // select the first view if none specified
        // BUG: but this resets other url params like `inputMask`
        if (viewId == null) {
            const viewList = await fetcher<ViewDescriptor[]>({
                url: `/api/views/${tableId}`,
                method: "GET",
                headers: context.req.headers as HeadersInit,
            })
            const defaultViewId = viewList[0].id

            return {
                redirect: {
                    destination: `/project/${projectId}/table/${tableId}?viewId=${defaultViewId}`,
                    permanent: false,
                },
            }
        }

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

        /** @deprecated */
        const selectView = pageActionUtil.use<ViewDescriptor["id"]>("selectView")

        return {
            props: {
                actions: pageActionUtil.actions,
                inputMask,
                openRow,
            } as PageProps,
        }
    })
)

export default Page
