import AutoDeleteIcon from "@mui/icons-material/AutoDelete"
import DiscFullIcon from "@mui/icons-material/DiscFull"
import { Box, Stack, Toolbar, Tooltip, Typography } from "@mui/material"
import { useUndoManager } from "hooks/useUndoManager"
import { useUserSettings } from "hooks/useUserSettings"

export const UndoHistoryFooter: React.FC = () => {
    const { undoManager } = useUndoManager()
    const { userSettings } = useUserSettings()

    if (undoManager == null || userSettings == null) return <>Lädt...</>

    return (
        <Toolbar>
            <Stack direction="row" gap={1}>
                {undoManager.state != null && undoManager.state < undoManager.size - 1 && (
                    <Tooltip
                        arrow
                        placement="bottom"
                        title={`Wenn Sie jetzt weitere Änderungen vornehmen, wird Ihr Änderungsverlauf ab der Änderung ${
                            undoManager.state! + 1
                        } 'abgeschnitten'. Sie können die rückgängig gemachten Änderungen ${
                            undoManager.state! + 2
                        } bis ${undoManager.size} nicht wiederholen!`}
                    >
                        <AutoDeleteIcon color="warning" fontSize="small" sx={{ cursor: "help" }} />
                    </Tooltip>
                )}
                {undoManager.size >= userSettings.undoCacheLimit && (
                    <Tooltip
                        arrow
                        placement="bottom"
                        title="Das Cache-Limit ist erreicht. Weitere Änderungen löschen die ältesten Einträge. Vergrößeren Sie bei Bedarf das Cache-Limit (mehr Speicher wird vereinnahmt)."
                    >
                        <DiscFullIcon color="warning" fontSize="small" sx={{ cursor: "help" }} />
                    </Tooltip>
                )}
            </Stack>
            <Box flexGrow={1} />
            <Typography variant="caption">
                {undoManager.size} {undoManager.size === 1 ? "Änderung" : "Änderungen"}
            </Typography>
        </Toolbar>
    )
}
