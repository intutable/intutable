import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import RedoIcon from "@mui/icons-material/Redo"
import UndoIcon from "@mui/icons-material/Undo"
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
import { Beta } from "components/Beta"
import { useUndoManager } from "hooks/useUndoManager"
import { useUserSettings } from "hooks/useUserSettings"
import { DispatchWithoutAction } from "react"
import { useTextFieldChangeStore } from "utils/useTextFieldChangeStore"
import { HelperIcon } from "./HelperIcon"

const VerticalDivider: React.FC = () => (
    <Divider orientation="vertical" flexItem variant="middle" sx={{ mx: 3 }} />
)

export const UndoHistoryHead: React.FC<{ forceUpdate: DispatchWithoutAction }> = ({
    forceUpdate,
}) => {
    const { undoManager } = useUndoManager()
    const { userSettings, changeUserSetting } = useUserSettings()
    const theme = useTheme()

    const { value: undoCacheLimit, onChangeHandler: onChangeCacheLimit } =
        useTextFieldChangeStore<number>(userSettings?.undoCacheLimit ?? 20)

    if (undoManager == null || userSettings == null) return <>Lädt...</>

    return (
        <Toolbar>
            <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="h6" component="div">
                    Änderungsverlauf der Sitzung{" "}
                </Typography>
                <HelperIcon title="Enthält nur Ihre Änderungen der aktuellen Browser-Session (nicht persistent)." />
                <Beta />
            </Stack>
            <Box flexGrow={1} />

            {userSettings.enableUndoCache && undoManager.size > 0 && (
                <>
                    <Tooltip
                        title="Die letzte Änderung rückgängig machen (undo)."
                        arrow
                        placement="top"
                        enterDelay={1000}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                "&:hover": {
                                    color: theme.palette.success.light,
                                },
                            }}
                            disabled={undoManager.everythingUndone}
                            onClick={async () => {
                                await undoManager.undoLast()
                                forceUpdate()
                            }}
                        >
                            <UndoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title="Diese letzte Änderung wiederholen (redo)."
                        arrow
                        placement="top"
                        enterDelay={1000}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                "&:hover": {
                                    color: theme.palette.warning.light,
                                },
                            }}
                            disabled={undoManager.state === undoManager.size - 1}
                            onClick={async () => {
                                await undoManager.redoLast()
                                forceUpdate()
                            }}
                        >
                            <RedoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <VerticalDivider />
                </>
            )}

            <FormControlLabel
                checked={userSettings.enableUndoCache}
                control={
                    <Switch
                        color="primary"
                        onChange={e => {
                            changeUserSetting({
                                enableUndoCache: e.target.checked,
                            })
                            forceUpdate()
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
                onChange={onChangeCacheLimit}
                value={undoCacheLimit}
                onBlur={e => {
                    if (undoCacheLimit < 2) return
                    changeUserSetting({
                        undoCacheLimit,
                    })
                    forceUpdate()
                }}
                onKeyDown={e => {
                    if (e.key === "Enter" && undoCacheLimit >= 2) {
                        e.currentTarget.blur()
                        changeUserSetting({
                            undoCacheLimit,
                        })
                    }
                }}
                label="Limit"
                type="number"
            />

            <VerticalDivider />
            <Tooltip title="Cache löschen" arrow placement="bottom" enterDelay={100}>
                <IconButton
                    size="small"
                    onClick={() => {
                        undoManager.clearCache()
                        forceUpdate()
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
