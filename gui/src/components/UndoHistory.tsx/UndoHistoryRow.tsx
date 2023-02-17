import { Memento } from "utils/UndoManager"

import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt"
import MoveDownIcon from "@mui/icons-material/MoveDown"
import MoveUpIcon from "@mui/icons-material/MoveUp"
import PlaceIcon from "@mui/icons-material/Place"
import RedoIcon from "@mui/icons-material/Redo"
import UndoIcon from "@mui/icons-material/Undo"
import {
    Box,
    Chip,
    IconButton,
    TableCell,
    TableRow,
    TableRowProps,
    Tooltip,
    Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useUndoManager } from "hooks/useUndoManager"
import { useUserSettings } from "hooks/useUserSettings"
import { stringToColor } from "utils/stringToColor"
import { getFormattedTimeString } from "./getFormattedTimeString"
import { getListPosition } from "./getListPosition"
import { isCurrentMemento } from "./isCurrentMemento"
import KeyIcon from "@mui/icons-material/Key"
import { format } from "./format"
import { useRouter } from "next/router"
import { UrlObject } from "url"
import { FormattedTimeStringCell } from "./FormattedTimeStringCell"

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
    const router = useRouter()

    if (undoManager == null || userSettings == null) return <>Lädt...</>
    const { history } = undoManager
    const position = getListPosition(memento, history)

    return (
        <TableRow
            {...props.TableRowProps}
            sx={{
                bgcolor: userSettings.enableUndoCache
                    ? "inherit"
                    : theme.palette.action.disabledBackground,
            }}
        >
            <TableCell>
                {isCurrentMemento(memento, history) ? (
                    <Tooltip title="Letzte Änderung" arrow placement="top">
                        <ArrowRightAltIcon color="success" />
                    </Tooltip>
                ) : (
                    index + 1
                )}
            </TableCell>
            <FormattedTimeStringCell timestamp={memento.timestamp} />
            <TableCell>{userSettings.firstName + " " + userSettings.lastName} (Sie)</TableCell>
            <TableCell>
                <Box
                    onClick={() => {
                        const project = props.memento.snapshot.project
                        const table = props.memento.snapshot.table
                        const view = props.memento.snapshot.view
                        const url: UrlObject = {
                            pathname: `/project/${project.id}/table/${table.id}`,
                            query: {
                                viewId: view.id,
                            },
                        }
                        const as = `/project/${project.id}/table/${table.id}`
                        router.push(url, as)
                    }}
                    display="inline-block"
                    sx={{
                        "&:hover": {
                            textDecoration: "underline",
                            color: theme.palette.primary.main,
                        },
                        cursor: "pointer",
                    }}
                >
                    {memento.snapshot.column.name}
                </Box>{" "}
                /{" "}
                <Box
                    onClick={() => {
                        const project = props.memento.snapshot.project
                        const table = props.memento.snapshot.table
                        const view = props.memento.snapshot.view
                        const url: UrlObject = {
                            pathname: `/project/${project.id}/table/${table.id}`,
                            query: {
                                viewId: view.id,
                            },
                        }
                        const as = `/project/${project.id}/table/${table.id}`
                        router.push(url, as)
                    }}
                    display="inline-block"
                    sx={{
                        "&:hover": {
                            textDecoration: "underline",
                            color: theme.palette.primary.main,
                        },
                        cursor: "pointer",
                    }}
                >
                    {memento.snapshot.row.formattedPrimaryColumnValue} (#
                    {memento.snapshot.row.index})
                </Box>
            </TableCell>
            <TableCell>
                <Chip
                    size="small"
                    label={memento.action === "cell-value-changed" ? "Zelle" : "#Aktion#"}
                    sx={{
                        bgcolor: stringToColor(
                            memento.action === "cell-value-changed" ? "Zelle" : "#Aktion#"
                        ),
                        color: theme.palette.getContrastText(
                            stringToColor(
                                memento.action === "cell-value-changed" ? "Zelle" : "#Aktion#"
                            )
                        ),
                    }}
                />
            </TableCell>
            <TableCell>
                {format(memento.snapshot.oldValue, memento.snapshot.column.cellType)} zu{" "}
                {format(memento.snapshot.newValue, memento.snapshot.column.cellType)}
            </TableCell>
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
