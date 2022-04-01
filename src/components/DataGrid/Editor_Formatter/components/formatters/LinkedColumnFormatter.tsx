import { Formatter } from "@datagrid/Editor_Formatter/types/Formatter"
import { Box } from "@mui/material"
import React from "react"
import { useEffect } from "react"

export const _LinkedColumnFormatter: Formatter = props => {
    const { column } = props

    return (
        <Box
            sx={{
                cursor: "cell",
            }}
        />
    )
}

export const LinkedColumnFormatter = React.memo(_LinkedColumnFormatter)
