import { TableCell, TableRow, Tooltip } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useUserSettings } from "hooks/useUserSettings"

import PanToolIcon from "@mui/icons-material/PanTool"

export const EverythingUndone: React.FC = () => {
    const theme = useTheme()
    const { userSettings } = useUserSettings()

    return (
        <TableRow
            sx={{
                bgcolor: userSettings?.enableUndoCache
                    ? "inherit"
                    : theme.palette.action.disabledBackground,
            }}
        >
            <TableCell>
                <Tooltip
                    title="Ende des Änderungsverlaufs. Jede Änderung wurde rückgängig gemacht."
                    arrow
                    placement="top"
                >
                    <PanToolIcon color="disabled" fontSize="small" sx={{ cursor: "help" }} />
                </Tooltip>
            </TableCell>
            <TableCell>
                <em>
                    Sie haben jede Ihrer Änderungen rückgängig gemacht. Keine weiteren Änderungen
                    zum Rückgängigmachen.
                </em>
            </TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell align="right">
                <Tooltip
                    title="Ende des Änderungsverlaufs. Jede Änderung wurde rückgängig gemacht."
                    arrow
                    placement="top"
                >
                    <PanToolIcon color="disabled" fontSize="small" sx={{ cursor: "help" }} />
                </Tooltip>
            </TableCell>
        </TableRow>
    )
}
