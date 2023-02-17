import { Box, TableCell } from "@mui/material"
import { useState } from "react"
import { getFormattedTimeString } from "./getFormattedTimeString"

export const FormattedTimeStringCell: React.FC<{ timestamp: number }> = ({ timestamp }) => {
    const [hovering, setHovering] = useState<boolean>(false)

    return (
        <TableCell onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            {hovering ? (
                <>{new Date(timestamp).toLocaleString()}</>
            ) : (
                <>{getFormattedTimeString(timestamp)}</>
            )}
        </TableCell>
    )
}
