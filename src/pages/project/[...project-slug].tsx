import React, { useCallback, useEffect, useMemo, useState } from "react"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import LoadingSkeleton from "../../components/DataGrid/LoadingSkeleton/LoadingSkeleton"
import Title from "@components/Head/Title"
import { CircularProgress, useTheme, Box, Typography } from "@mui/material"
import { Tablist, ADD_BUTTON_TOKEN } from "@components/TabList/TabList"
import DataGrid from "react-data-grid"
import { useTable, TableProvider } from "@context/TableContext"
import { getTableData, getListWithTables, TableData, addTable } from "@api"
import { useSnackbar } from "notistack"
import Toolbar from "@components/DataGrid/Toolbar/Toolbar"
import * as TItem from "@components/DataGrid/Toolbar/ToolbarItems"
import NoRowsRenderer from "@components/DataGrid/NoRowsOverlay/NoRowsRenderer"
import { isValidName, prepareName } from "@utils/validateName"
import { coreRequest, isAuthenticated } from "@app/api/coreinterface"
import { useAuth, User, USER_COOKIE_KEY } from "@context/AuthContext"
import { rowKeyGetter } from "@datagrid/utils"
import { getColumns, transformHelper } from "@datagrid/utils"

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

    const { error, loading, data, refresh, changeTable } = useTable()
    const { user, getUserAuthCookie } = useAuth()

    // #################### private methods ####################

    const handleTablistChange = (newTable: string | null) => {
        if (newTable === ADD_BUTTON_TOKEN) return changeTable(null)
        changeTable(newTable)
    }

    const handleAddTable = useCallback(
        async (newTableName: string) => {
            const name = prepareName(newTableName)
            const isValid = isValidName(name)
            if (isValid instanceof Error)
                return enqueueSnackbar(isValid.message, { variant: "error" })
            const nameIsTaken = data?.projectTables
                .map(tbl => tbl.toLowerCase().trim())
                .includes(name.toLowerCase().trim())
            if (nameIsTaken)
                return enqueueSnackbar(
                    "Dieser Name wird bereits für eine Tabelle in diesem Projekt verwendet!",
                    { variant: "error" }
                )
            if (!getUserAuthCookie)
                throw new Error(
                    "Internal Error: Der Benutzer-Cookie konnte nicht abgerufen werden!"
                )
            const authCookie = getUserAuthCookie()
            if (!user || !authCookie)
                return enqueueSnackbar("Du musst dich zuvor erneut anmelden", {
                    variant: "error",
                })
            try {
                await addTable(user, props.project, name, authCookie)
                await refresh()
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
        },
        [
            changeTable,
            data?.projectTables,
            enqueueSnackbar,
            getUserAuthCookie,
            props.project,
            refresh,
            user,
        ]
    )

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
        if (error instanceof Error)
            enqueueSnackbar("Die Tabelle konnte nicht geladen werden!", {
                variant: "error",
            })
    }, [error])

    // #################### component ####################

    return (
        <>
            <Title title={props.project} />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                {props.project}
            </Typography>

            <TableProvider projectName={props.project}>
                {error instanceof Error ? (
                    // Error
                    <Typography>
                        Error: Could not load the Table (reason: {error.message}
                        )!
                    </Typography>
                ) : // Loading
                loading ? (
                    <LoadingSkeleton />
                ) : // data is null
                data == null ? (
                    <>Table null</>
                ) : (
                    // Table
                    <>
                        <Tablist
                            value={data.currentTable}
                            data={data.projectTables}
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
                                    data.table ? (data.table.rows as any) : []
                                }
                                columns={
                                    data!.table
                                        ? getColumns(
                                              transformHelper(
                                                  data.table.columns
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
            </TableProvider>
        </>
    )
}

export const getServerSideProps: GetServerSideProps<
    ProjectSlugPageProps
> = async context => {
    const { params, req } = context
    const AUTH_COOKIE_KEY = process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY!
    const authCookie: string = req.cookies[AUTH_COOKIE_KEY]

    if (!(await isAuthenticated(authCookie).catch(e => false)))
        return {
            redirect: {
                permanent: false,
                destination: "/login",
            },
        }

    const user: User = { name: req.cookies[USER_COOKIE_KEY] }

    if (params && Object.hasOwnProperty.call(params, "project-slug")) {
        const _projectName = params["project-slug"]
        if (
            _projectName &&
            Array.isArray(_projectName) &&
            _projectName.length > 0
        ) {
            const projectName = _projectName[0] as string
            const serverRequest = await getListWithTables(
                user,
                projectName,
                authCookie
            )

            let dataOfFirstTable
            if (serverRequest.length > 0)
                dataOfFirstTable = await getTableData(
                    serverRequest[0],
                    projectName,
                    authCookie
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
