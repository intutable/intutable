import { ToggleButton, ToggleButtonGroup } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useAPI } from "hooks/useAPI"
import { useTables } from "hooks/useTables"
import { useViews } from "hooks/useViews"
import { useRouter } from "next/router"
import React from "react"
import { UrlObject } from "url"

export const TableNavigator: React.FC = () => {
    const theme = useTheme()
    const router = useRouter()

    const { project, table: currentTable } = useAPI()

    const { tables: tableList } = useTables()

    const changeTable = (
        event: React.MouseEvent<HTMLElement, MouseEvent>,
        targetTableId: number
    ) => {
        if (targetTableId == null || !project) return
        // const defaultView = views![0]

        const url: UrlObject = {
            pathname: `/project/${project.id}/table/${targetTableId}`,
            query: {
                // viewId: defaultView.id, // TODO: get the views of the table and select the first one, otherwise it redirects manually
            },
        }
        const as = `/project/${project.id}/table/${targetTableId}`
        router.push(url, as)
    }

    if (tableList == null) return null

    return (
        <>
            <ToggleButtonGroup
                value={currentTable?.id}
                exclusive
                onChange={changeTable}
                color="primary"
                sx={{ display: "block", mb: theme.spacing(5) }}
            >
                {tableList.map((table, index) => (
                    <ToggleButton key={index} value={table.id}>
                        {table.name}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </>
    )
}
export default TableNavigator
