import React, { useEffect, useState } from "react"
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"
import Title from "@components/Head/Title"
import { CircularProgress, Typography, useTheme, Box } from "@mui/material"
import { Tablist, ADD_BUTTON_TOKEN } from "@components/TabList/TabList"
import DataGrid from "react-data-grid"

import { getTableData, getListWithTables, TableData } from "@api"
import { useSnackbar } from "notistack"
import { isValidName, prepareName } from "@utils/validateName"
import { isAuthenticated } from "@utils/coreinterface"
import { User, USER_COOKIE_KEY } from "@context/AuthContext"

type ProjectSlugPageProps = {
    project: string
    tables: Array<string>
}

const ProjectSlugPage: NextPage<
    InferGetServerSidePropsType<typeof getServerSideProps>
> = props => {
    const [_tables, _setTables] = useState<
        Pick<ProjectSlugPageProps, "tables">["tables"]
    >(props.tables)
    const theme = useTheme()
    const { enqueueSnackbar } = useSnackbar()

    const [tableData, setTableData] = useState<TableData | null>(null)
    const [currentTable, setCurrentTable] = useState<string>(
        _tables[0] || ADD_BUTTON_TOKEN
    )
    const [loading, setLoading] = useState<boolean>(true)

    const handleTableChange = (newTable: string | null) => {
        if (newTable) setCurrentTable(newTable)
    }

    const handleAddTable = (newTableName: string) => {
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
        // NOTE: this request is blocking (the useEffect on `currentTable` wont be called until this fetch finished).
        // NOTE: this request must also create an empty table in the backend which gets fetched right after, otherwise this will lead to an error
        // TODO: make a request to backend here and then select new table
        _setTables(prev => [...prev, name])
        setTableData(null)
        setCurrentTable(name)
        enqueueSnackbar(`Du hast erfolgreich '${name}' erstellt!`, {
            variant: "success",
        })
    }

    const handleRenameTable = () => {
        alert("Not implemented yet")
        // TODO: implement
    }
    const handleDeleteTable = () => {
        alert("Not implemented yet")
        // TODO: implement
    }

    useEffect(() => {
        ;(async _ => {
            try {
                setLoading(true)
                const serverRequest = await getTableData(currentTable)
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
                <CircularProgress />
            ) : tableData ? (
                // TODO: seperate this into a new component which takes care of sending updates to the backend
                <Box>
                    <DataGrid
                        rows={tableData.rows as any}
                        columns={tableData.cols}
                    />
                </Box>
            ) : (
                <>Could not load the Table!</>
            )}
        </>
    )
}

export const getServerSideProps: GetServerSideProps<ProjectSlugPageProps> =
    async context => {
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

                const data: ProjectSlugPageProps = {
                    project: projectName,
                    tables: serverRequest,
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
