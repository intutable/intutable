import { TableCell, TableRow, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useUserSettings } from "hooks/useUserSettings"

export const EmptyHistoryOverlay: React.FC = () => {
    const theme = useTheme()
    const { userSettings } = useUserSettings()

    if (userSettings == null) return null

    return (
        <TableRow
            sx={{
                bgcolor: userSettings.enableUndoCache
                    ? "inherit"
                    : theme.palette.action.disabledBackground,
            }}
        >
            <TableCell>0</TableCell>
            <TableCell>
                <Typography>Keine Einträge im Änderungsverlauf vorhanden!</Typography>
            </TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell />
            <TableCell />
        </TableRow>
    )
}
