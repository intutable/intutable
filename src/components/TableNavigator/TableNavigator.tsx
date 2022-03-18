import { PMTypes as PM } from "types"
import { ToggleButton, ToggleButtonGroup, useTheme } from "@mui/material"
import { useRouter } from "next/router"
import React from "react"

type TableNavigatorProps = {
    project: PM.Project
    currentTable: PM.Table
    tableList: PM.Table[]
}

export const TableNavigator: React.FC<TableNavigatorProps> = props => {
    const theme = useTheme()
    const router = useRouter()

    return (
        <>
            <ToggleButtonGroup
                value={props.currentTable.id}
                exclusive
                onChange={(
                    event: React.MouseEvent<HTMLElement, MouseEvent>,
                    value: unknown
                ) => {
                    if (value == null || value === "null") return

                    router.push(
                        "/project/" + props.project.id + "/table/" + value,
                        undefined,
                        { shallow: false }
                    )
                }}
                color="primary"
                sx={{ display: "block", mb: theme.spacing(5) }}
            >
                {props.tableList.map((table, index) => (
                    <ToggleButton key={index} value={table.id}>
                        {table.name}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </>
    )
}
