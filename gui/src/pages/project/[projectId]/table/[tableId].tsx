import { SelectColumn } from "@datagrid/Cells/SelectColumn"
import LoadingSkeleton from "@datagrid/LoadingSkeleton"
import { RowRenderer } from "@datagrid/renderers"
import RowMask from "@datagrid/RowMask/RowMask"
import Toolbar from "@datagrid/Toolbar/Toolbar"
import * as ToolbarItem from "@datagrid/Toolbar/ToolbarItems"
import { ViewDescriptor } from "@intutable/lazy-views"
import { Box, Button, Grid, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { fetcher } from "api"
import { withSessionSsr } from "auth"
import Link from "components/Link"
import MetaTitle from "components/MetaTitle"
import { TableNavigator } from "components/TableNavigator"
import { ViewNavigator } from "components/ViewNavigator"
import { HeaderSearchFieldProvider, useHeaderSearchField } from "context"
import { RowMaskProvider } from "context/RowMaskContext"
import { SelectedRowsContextProvider, useSelectedRows } from "context/SelectedRowsContext"
import { APIQueries, parseQuery, useAPI } from "hooks/useAPI"
import { useBrowserInfo } from "hooks/useBrowserInfo"
import { useCellNavigation } from "hooks/useCellNavigation"
import { useRow } from "hooks/useRow"
import { useSnacki } from "hooks/useSnacki"
import { useTables } from "hooks/useTables"
import { useView } from "hooks/useView"
import { InferGetServerSidePropsType, NextPage } from "next"
import { useThemeToggler } from "pages/_app"
import React, { useEffect, useState } from "react"
import DataGrid from "react-data-grid"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
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
                        </DndProvider>

                        <Toolbar position="bottom">
                            <ToolbarItem.Connection status="connected" />
                        </Toolbar>
                    </Box>
                </Grid>

                <RowMask />
            </Grid>
        </>
    )
}

const Page: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => {
    return (
        <SelectedRowsContextProvider>
            <HeaderSearchFieldProvider>
                <RowMaskProvider>
                    <TablePage />
                </RowMaskProvider>
            </HeaderSearchFieldProvider>
        </SelectedRowsContextProvider>
    )
}

export const getServerSideProps = withSSRCatch(
    withSessionSsr(async context => {
        const { projectId, tableId, viewId } = parseQuery<APIQueries>(context.query, [
            "projectId",
            "tableId",
            "viewId",
        ])

        if (projectId == null || tableId == null)
            return {
                notFound: true,
            }

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
                    permanent: true,
                },
            }
        }

        const user = context.req.session.user
        if (user == null || user.isLoggedIn === false)
            return {
                notFound: true,
            }

        return {
            props: {},
        }
    })
)

export default Page
