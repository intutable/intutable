import React, { useEffect, useState } from "react"
import type { NextPage } from "next"
import AddIcon from "@mui/icons-material/Add"
import { Box, ToggleButtonGroup, ToggleButton, useTheme, CircularProgress } from "@mui/material"
import Title from "@components/Head/Title"
import { Data, useProject } from "@utils/useProject"
import { getAllProjectsWithTables } from "../utils/getData"
import { useAuth } from "../utils/useAuth"

const testData: Data = [
    { project: "Projekt1", tables: ["Table1.1", "Table1.2", "Table1.3"] },
    { project: "Projekt2", tables: ["Table2.1", "Table2.2", "Table2.3"] },
    { project: "Projekt3", tables: ["Table3.1", "Table3.2", "Table3.3"] },
]

type TablistProps = {
    value: string | null
    data: Array<string>
    onChangeHandler: (val: string | null) => void
    onAddHandler: (name: string) => void
}

const Tablist: React.FC<TablistProps> = props => {
    const ADD_BUTTON_NAME = "__ADD__"
    const theme = useTheme()

    const handler = (_: unknown, val: string | null) => {
        // BUG: when creating a new proj without tables, the add button's value will be null for unknown reason.
        // because of that 'null' is catched and interpreteted as 'ADD_BUTTON_NAME'
        // TODO: fix this
        // NOTE: this causes a bug, where clicking on a already selected toggle button will pass the below if and prompt for adding a new entitiy
        if ((typeof val === "string" && val === ADD_BUTTON_NAME) || val === null) {
            const name = prompt("Choose new Name")
            if (name) props.onAddHandler(name)
        } else props.onChangeHandler(val)
    }

    return (
        <ToggleButtonGroup
            value={props.value || ADD_BUTTON_NAME}
            exclusive
            onChange={handler}
            color="primary"
            sx={{ display: "block", mb: theme.spacing(5) }}
        >
            {props.data.map((element, index) => (
                <ToggleButton key={index} value={element}>
                    {element}
                </ToggleButton>
            ))}
            <ToggleButton key={props.data.length} value={ADD_BUTTON_NAME}>
                <AddIcon />
            </ToggleButton>
        </ToggleButtonGroup>
    )
}

const isValidName = (name: string): true | Error => {
    const letters = /^[a-zA-Z]+$/
    if (!letters.test(name)) return new Error("The Name must contain only letters!")
    return true
}
const prepareName = (name: string): string => name.trim()

const Dashboard: NextPage = () => {
    // #################### States and Vars ####################
    const [loading, setLoading] = useState(false)
    const data = useProject(testData)
    const { user } = useAuth({ name: "nick@baz.org" })

    // #################### Handlers ####################
    const handleProjectChange = (newProject: string | null) => {
        if (newProject) data.changeProject(newProject)
    }
    const handleAddProject = (newProject: string) => {
        const name = prepareName(newProject)
        const isvalid = isValidName(name)
        if (isvalid instanceof Error) return alert(isvalid.message)
        if (data.projects.map(proj => proj.toLowerCase()).includes(name.toLowerCase()))
            return alert("This name is already in use!")
        testData.push({ project: name, tables: [] })
        data.refresh(testData, { project: name })
    }

    const handleTableChange = (newTable: string | null) => {
        if (newTable) data.changeTable(newTable)
    }
    const handleAddTable = (newTable: string) => {
        const name = prepareName(newTable)
        const isvalid = isValidName(name)
        if (isvalid instanceof Error) return alert(isvalid.message)
        if (data.tables.map(tbl => tbl.toLowerCase()).includes(name.toLowerCase()))
            return alert("This name is already in use!")
        if (data.project) {
            testData.forEach(proj => {
                if (proj.project === data.project) {
                    proj.tables.push(name)
                }
            })
            data.refresh(testData, { project: data.project, table: name })
        } else alert("Can not create a Table without a Project!")
    }

    // #################### Lifecycle ####################
    // TODO: this is for `Sprint 2`
    // useEffect(() => {
    //     ;(async _ => {
    //         // initial fetch to populate
    //         const initialData = await getAllProjectsWithTables(user)
    //         console.dir(initialData)
    //         // data.init(initialData)
    //     })()
    // }, [user])

    // #################### Components ####################
    if (loading) return <CircularProgress />

    return (
        <>
            <Title title="Dashboard" />
            <Box>
                {/* Projects */}
                <Tablist
                    value={data.project}
                    data={data.projects}
                    onChangeHandler={handleProjectChange}
                    onAddHandler={handleAddProject}
                />

                {/* Tables */}
                <Tablist
                    value={data.table}
                    data={data.tables}
                    onChangeHandler={handleTableChange}
                    onAddHandler={handleAddTable}
                />

                {/* Table */}
                <Box>
                    {data.project} - {data.table}
                    {/* <DataGrid
                        rows={data.rows}
                        columns={data.cols}
                        pageSize={25}
                        autoHeight
                        rowsPerPageOptions={[5, 25, 50, 100]}
                        checkboxSelection
                        disableSelectionOnClick
                        components={{
                            Toolbar: CustomToolbar,
                            NoRowsOverlay: CustomNoRowsOverlay,
                            Footer: CustomFooterComponent,
                            ColumnMenu: CustomColumnMenuComponent,
                        }}
                        componentsProps={{
                            footer: { status },
                        }}
                    /> */}
                </Box>
            </Box>
        </>
    )
}

export default Dashboard
