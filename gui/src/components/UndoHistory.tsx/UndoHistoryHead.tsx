import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import KeyboardIcon from "@mui/icons-material/Keyboard"
import {
    Box,
    Divider,
    FormControlLabel,
    IconButton,
    Stack,
    Switch,
    TextField,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useUndoManager } from "hooks/useUndoManager"
import { useUserSettings } from "hooks/useUserSettings"
import { HelperIcon } from "./HelperIcon"

const VerticalDivider: React.FC = () => (
    <Divider orientation="vertical" flexItem variant="middle" sx={{ mx: 3 }} />
)

export const UndoHistoryHead: React.FC = () => {
    const { undoManager } = useUndoManager()
    const { userSettings, changeUserSetting } = useUserSettings()
    const theme = useTheme()

    if (undoManager?.history == null || userSettings == null) return <>Lädt...</>

    return (
        <Toolbar>
            <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="h6" component="div">
                    Änderungsverlauf der Sitzung{" "}
                </Typography>
                <HelperIcon title="Enthält nur Ihre Änderungen der aktuellen Browser-Session (nicht persistent)." />
            </Stack>
            <Box flexGrow={1} />

            <IconButton>
                <KeyboardIcon />
            </IconButton>

            <VerticalDivider />
            <FormControlLabel
                checked={userSettings.enableUndoCache}
                control={
                    <Switch
                        color="primary"
                        onChange={e => {
                            changeUserSetting({
                                enableUndoCache: e.target.checked,
                            })
                        }}
                    />
                }
                label="Cache aktiviert"
                labelPlacement="start"
            />

            <VerticalDivider />
            <TextField
                size="small"
                sx={{ width: 100 }}
                margin="none"
                onChange={e => {
                    const value = parseInt(e.target.value)
                    if (value < 2) return
                    changeUserSetting({
                        undoCacheLimit: value,
                    })
                }}
                value={userSettings.undoCacheLimit}
                label="Limit"
                type="number"
            />

            <VerticalDivider />
            <Tooltip title="Cache löschen" arrow placement="bottom" enterDelay={100}>
                <IconButton
                    size="small"
                    onClick={() => {
                        undoManager.cleanUp()
                    }}
                    sx={{
                        "&:hover": {
                            color: theme.palette.warning.dark,
                        },
                    }}
                >
                    <DeleteForeverIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Toolbar>
    )
}
