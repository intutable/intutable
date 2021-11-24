import React, { useEffect, useMemo, useState } from "react"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import Title from "../../components/Head/Title"
import { Typography, useTheme, Box, Skeleton } from "@mui/material"
import LoadingSkeleton from "../../components/DataGrid/LoadingSkeleton/LoadingSkeleton"
import { Tablist, ADD_BUTTON_TOKEN } from "../../components/TabList/TabList"
import DataGrid from "react-data-grid"
import { getDataOfTable, getTablesOfProject, TableData } from "../../utils/getData"
import { useSnackbar } from "notistack"
import { isValidName, prepareName } from "../../utils/validateName"
import Toolbar from "../../components/DataGrid/Toolbar/Toolbar"
import * as TItem from "../../components/DataGrid/Toolbar/ToolbarItems"

type ProjectSlugPageProps = {
    project: string
    tables: Array<string>
}
const ProjectSlugPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = props => {
    const [_tables, _setTables] = useState<Pick<ProjectSlugPageProps, "tables">["tables"]>(
        props.tables
    )
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const [tableData, setTableData] = useState<TableData | null>(null)
    const [currentTable, setCurrentTable] = useState<string>(_tables[0] || ADD_BUTTON_TOKEN)
    const [loading, setLoading] = useState<boolean>(true)

    const handleTableChange = (newTable: string | null) => {
        if (newTable) setCurrentTable(newTable)
    }

    const handleAddTable = (newTableName: string) => {
        const name = prepareName(newTableName)
        const isValid = isValidName(name)
        if (isValid instanceof Error) return enqueueSnackbar(isValid.message, { variant: "error" })
        const nameIsTaken = _tables.map(tbl => tbl.toLowerCase()).includes(name.toLowerCase())
        if (nameIsTaken)
            return enqueueSnackbar(
                "Dieser Name wird bereits für eine Tabelle in diesem Projekt verwendet!",
                { variant: "error" }
            )
        // NOTE: this request is blocking (the useEffect on `currentTable` wont be called until this fetch finished).
        // NOTE: this request must also create an empty table in the backend which gets fetched right after, otherwise this will lead to an error
        // TODO: make a request to backend here and then select new table
        _setTables(prev => [...prev, name])
        setTableData(null)
        setCurrentTable(name)
        enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, { variant: "success" })
    }

    useEffect(() => {
        ;(async _ => {
            try {
                setLoading(true)
                const serverRequest = await getDataOfTable(currentTable)
                setTableData(serverRequest)
            } catch (error) {
                enqueueSnackbar("Fehler: Die Tabelle konnte nicht geladen werden!", {
                    variant: "error",
                })
                setTableData(null)
            } finally {
                setLoading(false)
            }
        })()
    }, [currentTable])

    const summaryRows = useMemo(() => {
        if (!tableData) return []
        const summaryRow = {
            id: "total_0",
            totalCount: tableData.rows.length,
        }
        return [summaryRow]
    }, [tableData])

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
            />
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <>
                    <Toolbar>
                        <TItem.AddCol addCol={() => {}} />
                        <Toolbar.Item onClickHandler={() => {}}>Tool 1</Toolbar.Item>
                        <Toolbar.Item onClickHandler={() => {}}>Tool 2</Toolbar.Item>
                        <Toolbar.Item onClickHandler={() => {}}>Tool 3</Toolbar.Item>
                        <Toolbar.Item onClickHandler={() => {}}>Tool 4</Toolbar.Item>
                        <Toolbar.Item onClickHandler={() => {}}>Tool 5</Toolbar.Item>
                        <TItem.FileDownload />
                    </Toolbar>
                    <Box>
                        <DataGrid
                            className={theme.themeMode === "light" ? "rdg-light" : "rdg-dark"}
                            rows={tableData.rows}
                            summaryRow={summaryRows}
                            columns={tableData.cols}
                        />
                    </Box>
                    <Toolbar>
                        <TItem.Connection status={"connected"} />
                        <Toolbar.Item onClickHandler={() => {}}>Tool 1</Toolbar.Item>
                        <Toolbar.Item onClickHandler={() => {}}>Tool 2</Toolbar.Item>
                    </Toolbar>
                </>
            )}
        </>
    )
}

export const getServerSideProps: GetServerSideProps<ProjectSlugPageProps> = async context => {
    const { params } = context

    const user = { name: "nick@baz.org" } // TODO: get user

    const serverRequet = await getTablesOfProject(user, params["project-slug"][0])

    const data: ProjectSlugPageProps = {
        project: params["project-slug"][0],
        tables: serverRequet,
    }

    const error = serverRequet == null
    if (error) return { notFound: true }

    return {
        props: data,
    }
}

export default ProjectSlugPage
