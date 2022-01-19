import React, { useCallback, useEffect, useMemo, useState } from "react"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import LoadingSkeleton from "../../components/DataGrid/LoadingSkeleton/LoadingSkeleton"
import Title from "@components/Head/Title"
import { CircularProgress, useTheme, Box, Typography } from "@mui/material"
import { Tablist, ADD_BUTTON_TOKEN } from "@components/TabList/TabList"
import DataGrid from "react-data-grid"
import {
    getTableData,
    getTablesFromProject,
    createTableInProject,
} from "@api/endpoints"
import type { TableData } from "@api/types"
import { useSnackbar } from "notistack"
import Toolbar from "@components/DataGrid/Toolbar/Toolbar"
import * as TItem from "@components/DataGrid/Toolbar/ToolbarItems"
import NoRowsRenderer from "@components/DataGrid/NoRowsOverlay/NoRowsRenderer"
import { isValidName, prepareName } from "@utils/validateName"
import { isAuthenticated } from "@app/api/endpoints/coreinterface"
import { useAuth, User, USER_COOKIE_KEY } from "@context/AuthContext"
import { rowKeyGetter } from "@datagrid/utils"
import { getColumns, transformHelper } from "@datagrid/utils"
import { useProject } from "@context/useProject"

type ProjectSlugPageProps = {
    project: string
    tables: string[]
    table: { data: TableData; name: string } | null
}

const ProjectSlugPage: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    // #################### states ####################

    const { user } = useAuth()
    const { state, changeTable, reload } = useProject(props.project, {
        tables: props.tables,
        currentTable: props.table?.name || "",
        data: props.table?.data || null,
    })

    // #################### private methods ####################

    const handleTablistChange = (newTable: string | null) => {
        if (newTable === null || newTable === ADD_BUTTON_TOKEN)
            return changeTable("")
        changeTable(newTable)
    }

    const handleAddTable = useCallback(async (newTableName: string) => {
        const name = prepareName(newTableName)
        const isValid = isValidName(name)
        if (isValid instanceof Error)
            return enqueueSnackbar(isValid.message, { variant: "error" })
        const nameIsTaken = state.project?.tables
            .map(tbl => tbl.toLowerCase().trim())
            .includes(name.toLowerCase().trim())
        if (nameIsTaken)
            return enqueueSnackbar(
                "Dieser Name wird bereits für eine Tabelle in diesem Projekt verwendet!",
                { variant: "error" }
            )
        if (!user)
            return enqueueSnackbar("Du musst dich zuvor erneut anmelden", {
                variant: "error",
            })
        try {
            await createTableInProject(user, props.project, name)
            await reload(name)
            changeTable(name)
            enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
                variant: "success",
            })
        } catch (error) {
            console.error(error)
            enqueueSnackbar("Die Tabelle konnte nicht erstellt werden!", {
                variant: "error",
            })
        }
    }, [])

    const handleRenameTable = () => {
        alert("Not implemented yet")
        // TODO: implement
    }
    const handleDeleteTable = () => {
        alert("Not implemented yet")
        // TODO: implement
    }

    // #################### life cycle methods ####################

    useEffect(() => {
        if (state.error instanceof Error) {
            console.log(state.error)
            enqueueSnackbar("Die Tabelle konnte nicht geladen werden!", {
                variant: "error",
            })
        }
    }, [state.error])

    // #################### component ####################

    return (
        <>
            <Title title={props.project} />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                {props.project}
            </Typography>

            {state.error instanceof Error ? (
                // Error
                <Typography>
                    Error: Could not load the Table (reason:{" "}
                    {state.error.message}
                    )!
                </Typography>
            ) : // Loading
            state.loading ? (
                <LoadingSkeleton />
            ) : // data is null
            state.project == null ? (
                <>Table null {state}</>
            ) : (
                // Table
                <>
                    <Tablist
                        value={state.project.currentTable}
                        data={state.project.tables}
                        onChangeHandler={handleTablistChange}
                        onAddHandler={handleAddTable}
                        contextMenuItems={[
                            <Box onClick={handleRenameTable} key={0}>
                                Rename
                            </Box>,
                            <Box
                                onClick={handleDeleteTable}
                                key={1}
                                sx={{ color: theme.palette.warning.main }}
                            >
                                Delete
                            </Box>,
                        ]}
                    />
                    <Box>
                        <Toolbar position="top">
                            <TItem.AddCol addCol={() => {}} />
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 1
                            </Toolbar.Item>
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 2
                            </Toolbar.Item>
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 3
                            </Toolbar.Item>
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 4
                            </Toolbar.Item>
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 5
                            </Toolbar.Item>
                            <TItem.FileDownload getData={() => []} />
                        </Toolbar>
                        <DataGrid
                            className={
                                theme.palette.mode === "light"
                                    ? "rdg-light"
                                    : "rdg-dark"
                            }
                            rows={
                                state.project.data
                                    ? (state.project.data.rows as any)
                                    : []
                            }
                            columns={
                                state.project.data
                                    ? getColumns(
                                          transformHelper(
                                              state.project.data.columns
                                          )
                                      )
                                    : [{ key: "id", name: "ID" }]
                            }
                            noRowsFallback={<NoRowsRenderer />}
                            rowKeyGetter={rowKeyGetter}
                            defaultColumnOptions={{
                                sortable: true,
                                resizable: true,
                            }}
                            // onColumnResize={}
                            // onRowDoubleClick={}
                            // onFill={handleFill}
                            // selectedRows={selectedRows}
                            // onSelectedRowsChange={setSelectedRows}
                        />
                        <Toolbar position="bottom">
                            <TItem.Connection status={"connected"} />
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 1
                            </Toolbar.Item>
                            <Toolbar.Item onClickHandler={() => {}}>
                                Tool 2
                            </Toolbar.Item>
                        </Toolbar>
                    </Box>
                </>
            )}
        </>
    )
}

export const getServerSideProps: GetServerSideProps<
    ProjectSlugPageProps
> = async context => {
    const { params, req } = context
    const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!
    const cookie: string = req.cookies[AUTH_COOKIE_KEY]

    if (!(await isAuthenticated(cookie).catch(e => false)))
        return {
            redirect: {
                permanent: false,
                destination: "/login",
            },
        }

    const user: User = {
        name: req.cookies[USER_COOKIE_KEY],
        cookie,
    }

    if (params && Object.hasOwnProperty.call(params, "project-slug")) {
        const _projectName = params["project-slug"]
        if (
            _projectName &&
            Array.isArray(_projectName) &&
            _projectName.length > 0
        ) {
            const projectName = _projectName[0] as string
            const serverRequest = await getTablesFromProject(user, projectName)

            let dataOfFirstTable
            if (serverRequest.length > 0)
                dataOfFirstTable = await getTableData(
                    user,
                    serverRequest[0],
                    projectName
                )
            else dataOfFirstTable = null

            const data: ProjectSlugPageProps = {
                project: projectName,
                tables: serverRequest,
                table: dataOfFirstTable
                    ? { data: dataOfFirstTable, name: serverRequest[0] }
                    : null,
            }

            const error = serverRequest == null
            if (error) return { notFound: true }

            return {
                props: data,
            }
        }
    }
    return { notFound: true }
}

export default ProjectSlugPage
