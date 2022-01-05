import React, { useEffect, useMemo, useState } from "react"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import LoadingSkeleton from "../../components/DataGrid/LoadingSkeleton/LoadingSkeleton"
import Title from "@components/Head/Title"
import { CircularProgress, Typography, useTheme, Box } from "@mui/material"
import { Tablist, ADD_BUTTON_TOKEN } from "@components/TabList/TabList"
import DataGrid from "react-data-grid"

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
    tables: Array<string>
    table: { data: TableData; name: string } | null
}

const ProjectSlugPage: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    const [_tables, _setTables] = useState<
        Pick<ProjectSlugPageProps, "tables">["tables"]
    >(props.tables)
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()
    const { user, getUserAuthCookie } = useAuth()
    const [tableData, setTableData] = useState<TableData | null>(
        props.table ? props.table.data : null
    )
    const [currentTable, setCurrentTable] = useState<string>(
        props.table ? props.table.name : ADD_BUTTON_TOKEN
    )
    const [loading, setLoading] = useState<boolean>(true)

    const handleTableChange = (newTable: string | null) => {
        if (newTable) setCurrentTable(newTable)
    }

    const handleAddTable = async (newTableName: string) => {
        const name = prepareName(newTableName)
        const isValid = isValidName(name)
        if (isValid instanceof Error)
            return enqueueSnackbar(isValid.message, { variant: "error" })
        const nameIsTaken = _tables
            .map(tbl => tbl.toLowerCase())
            .includes(name.toLowerCase())
        if (nameIsTaken)
            return enqueueSnackbar(
                "Dieser Name wird bereits für eine Tabelle in diesem Projekt verwendet!",
                { variant: "error" }
            )
        if (!getUserAuthCookie) throw new Error("")
        const authCookie = getUserAuthCookie()
        if (!user || !authCookie)
            return enqueueSnackbar("Du musst dich zuvor erneut anmelden", {
                variant: "error",
            })
        // NOTE: this request is blocking (the useEffect on `currentTable` wont be called until this fetch finished).
        // NOTE: this request must also create an empty table in the backend which gets fetched right after, otherwise this will lead to an error
        // TODO: make a request to backend here and then select new table
        const success = await addTable(user, props.project, name, authCookie)
        if (!success)
            return enqueueSnackbar(
                "Die Tabelle konnte nicht erstellt werden!",
                { variant: "error" }
            )
        _setTables(prev => [...prev, name])
        setTableData(null)
        setCurrentTable(name)
        enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
            variant: "success",
        })
        console.log(tableData)
    }

    const handleRenameTable = () => {
        alert("Not implemented yet")
        // TODO: implement
    }
    const handleDeleteTable = () => {
        alert("Not implemented yet")
        // TODO: implement
    }

    // function handleFill({ columnKey, sourceRow, targetRow }: FillEvent<Row>): Row {
    //     return { ...targetRow, [columnKey]: sourceRow[columnKey as keyof Row] }
    // }

    // loads the data for the current table, if the table gets changed
    useEffect(() => {
        ;(async _ => {
            if (currentTable !== ADD_BUTTON_TOKEN) {
                try {
                    if (!getUserAuthCookie) throw new Error("")
                    const authCookie = getUserAuthCookie()
                    if (!authCookie)
                        return enqueueSnackbar(
                            "Du musst dich zuerst neu anmelden!",
                            { variant: "error" }
                        )
                    setLoading(true)
                    const serverRequest = await getTableData(
                        currentTable,
                        props.project,
                        authCookie
                    )
                    setTableData(serverRequest)
                } catch (error) {
                    enqueueSnackbar(
                        "Fehler: Die Tabelle konnte nicht geladen werden!",
                        {
                            variant: "error",
                        }
                    )
                    setTableData(null)
                } finally {
                    setLoading(false)
                }
            }
        })()
    }, [currentTable])

    return (
        <>
            <Title title={props.project} />
            <Typography variant="h5" sx={{ mb: theme.spacing(4) }}>
                {props.project}
            </Typography>
            <Tablist
                value={currentTable}
                data={_tables}
                onChangeHandler={handleTableChange}
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
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <>
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
                            rows={tableData ? (tableData.rows as any) : []}
                            columns={
                                tableData
                                    ? getColumns(
                                          transformHelper(tableData.columns)
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
