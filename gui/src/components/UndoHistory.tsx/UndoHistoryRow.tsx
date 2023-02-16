import { Memento } from "utils/UndoManager"

import {
    Box,
    Chip,
    Divider,
    FormControlLabel,
    IconButton,
    Paper,
    Switch,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableRowProps,
    TableRowTypeMap,
    TextField,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material"
import ClearIcon from "@mui/icons-material/Clear"
import { useUndoManager } from "hooks/useUndoManager"
import UndoIcon from "@mui/icons-material/Undo"
import RedoIcon from "@mui/icons-material/Redo"
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt"
import { useUserSettings } from "hooks/useUserSettings"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { useTheme } from "@mui/material/styles"
import InfoIcon from "@mui/icons-material/Info"
import KeyboardIcon from "@mui/icons-material/Keyboard"
import MoveUpIcon from "@mui/icons-material/MoveUp"
import MoveDownIcon from "@mui/icons-material/MoveDown"
import { getFormattedTimeString } from "./getFormattedTimeString"
import { getListPosition } from "./getListPosition"
import { OverridableComponent } from "@mui/material/OverridableComponent"
import PlaceIcon from "@mui/icons-material/Place"
import { stringToColor } from "utils/stringToColor"

export type MementoRowProps = {
    memento: Memento
    index: number
    TableRowProps: TableRowProps
}
export const MementoRow: React.FC<MementoRowProps> = props => {
    const { undoManager } = useUndoManager()
    const { userSettings } = useUserSettings()
    const theme = useTheme()
    const { memento, index } = props

    if (undoManager?.history == null || userSettings == null) return <>Lädt...</>

    const position = getListPosition(memento, undoManager.history)

    return (
        <TableRow {...props.TableRowProps}>
            <TableCell>
                {undoManager.history?.pointer === memento.uid ? (
                    <Tooltip title="Aktuelle Änderung" arrow placement="top">
                        <ArrowRightAltIcon color="success" />
                    </Tooltip>
                ) : (
                    index + 1
                )}
            </TableCell>
            <TableCell>{getFormattedTimeString(memento.timestamp)}</TableCell>
            <TableCell>{userSettings.firstName + " " + userSettings.lastName} (Sie)</TableCell>
            <TableCell>Projekt</TableCell>
            {/* <TableCell>Tabelle</TableCell>
            <TableCell>{memento.snapshot.viewId}</TableCell>
            <TableCell>{memento.snapshot.columnId}</TableCell>
            <TableCell>{memento.snapshot.rowId}</TableCell> */}
            <TableCell>
                <Chip
                    size="small"
                    label={"Zell-Wert"}
                    sx={{
                        bgcolor: stringToColor("Zell-Wert"),
                        color: theme.palette.getContrastText(stringToColor("Zell-Wert")),
                    }}
                />
            </TableCell>
            <TableCell>{memento.snapshot.oldValue + " --> " + memento.snapshot.newValue}</TableCell>
            <TableCell align="right">
                <Tooltip
                    title="Diese Änderung rückgängig machen (undo)."
                    arrow
                    placement="left"
                    enterDelay={1000}
                >
                    <IconButton
                        size="small"
                        sx={{
                            "&:hover": {
                                color: theme.palette.success.light,
                            },
                        }}
                        disabled={position === "after-pointer"}
                    >
                        <UndoIcon fontSize="small" />
                    </IconButton>
                </Tooltip>

                <Tooltip
                    title="Zu dieser Änderung springen"
                    arrow
                    placement={position === "before-pointer" ? "top" : "bottom"}
                    enterDelay={1000}
                >
                    <IconButton
                        size="small"
                        sx={{
                            "&:hover": {
                                color: theme.palette.warning.dark,
                            },
                        }}
                        disabled={position === "equal-to-pointer"}
                    >
                        {position === "before-pointer" && <MoveUpIcon fontSize="small" />}
                        {position === "equal-to-pointer" && <PlaceIcon fontSize="small" />}
                        {position === "after-pointer" && <MoveDownIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>

                <Tooltip
                    title="Diese Änderung wiederholen (redo)."
                    arrow
                    placement="right"
                    enterDelay={1000}
                >
                    <IconButton
                        size="small"
                        sx={{
                            "&:hover": {
                                color: theme.palette.warning.light,
                            },
                        }}
                        disabled={position !== "after-pointer"}
                    >
                        <RedoIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    )
}
