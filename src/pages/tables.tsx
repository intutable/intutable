import { useEffect, useState } from "react"
import type { NextPage } from "next"
import AddIcon from "@mui/icons-material/Add"
import { Box, ToggleButtonGroup, ToggleButton, useTheme } from "@mui/material"
import Title from "@components/Head/Title"
import { Data, useProject } from "@app/src/lib/useProject"

const testData: Data = [
    { project: "Projekt1", tables: ["Table1.1", "Table1.2", "Table1.3"] },
    { project: "Projekt2", tables: ["Table2.1", "Table2.2", "Table2.3"] },
    { project: "Projekt3", tables: ["Table3.1", "Table3.2", "Table3.3"] },
]

// string used for `value` arg in button group to indicate a button which adds e.g. a new project or table

type TablistProps = {
    value: string | null
    data: Array<string>
    onChangeHandler: (val: string | null) => void
    onAddHandler: (name: string) => void
}
const ADD_BUTTON_NAME = "__ADD__"

const Tablist: React.FC<TablistProps> = props => {
    const ADD_BUTTON_NAME = "__ADD__"
    const theme = useTheme()

    const handler = (_: unknown, val: string | null) => {
        // BUG: when creating a new proj without tables, the add button's value will be null for unknown reason.
        // because of that 'null' is catched and interpreteted as 'ADD_BUTTON_NAME'
        // TODO: fix this
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

const Test: NextPage = () => {
    const theme = useTheme()

    const status = "connected"
    const data = useProject(testData)

    const handleProjectChange = (newProject: string | null) => {
        if (newProject) data.changeProject(newProject)
    }
    const handleAddProject = (newProject: string) => {
        testData.push({ project: newProject, tables: [] })
        data.refresh(testData)
    }

    const handleTableChange = (newTable: string | null) => {
        if (newTable) data.changeTable(newTable)
    }
    const handleAddTable = (newTable: string) => {
        testData.forEach(proj => {
            if (proj.project === data.project) {
                proj.tables.push(newTable)
            }
        })
        data.refresh(testData)
    }

    return (
        <>
            <Title title="Test" />
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

export default Test
