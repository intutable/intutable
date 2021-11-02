import { useEffect, useState } from "react"
import type { NextPage } from "next"

import PeopleIcon from '@mui/icons-material/People'
import GroupsIcon from '@mui/icons-material/Groups'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'
import {
    Box,
    ToggleButtonGroup,
    ToggleButton,
    useTheme,
} from "@mui/material"
import {
    DataGrid
} from "@mui/x-data-grid"

import Title from "@components/Head/Title"
import {
    CustomColumnMenuComponent,
    CustomFooterComponent,
    CustomToolbar,
    CustomNoRowsOverlay,
} from "@components/DataGrid/Custom"
import { useTable, isTableType, Tables, Table } from "@lib/useTable"


const TableIconMap: { [key in Table]: React.ReactNode } = {
    Personen: <PeopleIcon />,
    Organe: <GroupsIcon />,
    Rollen: <SupervisorAccountIcon />
}

const Test: NextPage = () => {
    const theme = useTheme()
    const status = "connected"
    const { data, setTable } = useTable("Personen")
    const handleTableChange =
        (event: React.MouseEvent<HTMLElement>, newTableType: string | null) => {
            if (newTableType && isTableType(newTableType))
                setTable(newTableType)
        }

    return ( <>
        <Title title="Test" />
        <Box>
            <ToggleButtonGroup
                value={data.tableType}
                exclusive
                onChange={handleTableChange}
                color="primary">
                {Tables.map( (tbl, index) =>
                    <ToggleButton key={index} value={tbl}>
                        {TableIconMap[tbl]}&nbsp;{tbl}
                    </ToggleButton> )}
            </ToggleButtonGroup>
            <Box sx={{
                mt: theme.spacing(5) }}>
                <DataGrid
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
                        ColumnMenu: CustomColumnMenuComponent
                    }}
                    componentsProps={{
                        footer: { status }
                    }} />
            </Box>
        </Box>
    </> )
}


export default Test
