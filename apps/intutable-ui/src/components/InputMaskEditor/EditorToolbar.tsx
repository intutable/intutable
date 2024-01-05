import { Box, Toolbar, Tooltip, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { InputMask } from "@shared/input-masks/types"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled"
import StopCircleIcon from "@mui/icons-material/StopCircle"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import { IconButton } from "@mui/material"
import React from "react"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { useRouter } from "next/router"

export const EditorToolbar: React.FC<{ inputMask: InputMask; valid: boolean }> = ({
    inputMask,
    valid,
}) => {
    const theme = useTheme()
    const router = useRouter()

    const open = () => router.push("/")

    return (
        <Toolbar variant="dense">
            <Typography variant="h5" component={"h1"} fontStyle="italic">
                {inputMask.name}
            </Typography>
            {valid && (
                <IconButton size="small" sx={{ color: theme.palette.text.disabled, ml: 1 }}>
                    <OpenInNewIcon fontSize="small" onClick={open} />
                </IconButton>
            )}
            <Box flexGrow={1} />
            <IconButton size="small" disabled={valid === false}>
                {inputMask.active ? (
                    <Tooltip
                        arrow
                        placement="bottom"
                        title="Eingabemaske ausblenden"
                        enterDelay={1500}
                    >
                        <VisibilityOffIcon
                            fontSize="small"
                            sx={{
                                "&:hover": { color: theme.palette.warning.main },
                            }}
                        />
                    </Tooltip>
                ) : (
                    <Tooltip
                        arrow
                        placement="bottom"
                        title="Eingabemaske einblenden"
                        enterDelay={1500}
                    >
                        <VisibilityIcon
                            fontSize="small"
                            sx={{
                                "&:hover": { color: theme.palette.success.main },
                            }}
                        />
                    </Tooltip>
                )}
            </IconButton>

            <IconButton size="small" disabled={valid === false}>
                {inputMask.disabled ?? false ? (
                    <Tooltip
                        arrow
                        placement="bottom"
                        title="Eingabemaske aktivieren"
                        enterDelay={1500}
                    >
                        <PlayCircleFilledIcon
                            fontSize="small"
                            sx={{
                                "&:hover": { color: theme.palette.success.main },
                            }}
                        />
                    </Tooltip>
                ) : (
                    <Tooltip
                        arrow
                        placement="bottom"
                        title="Eingabemaske deaktivieren"
                        enterDelay={1500}
                    >
                        <StopCircleIcon
                            fontSize="small"
                            sx={{
                                "&:hover": { color: theme.palette.warning.main },
                            }}
                        />
                    </Tooltip>
                )}
            </IconButton>

            <IconButton size="small">
                <Tooltip
                    arrow
                    placement="bottom"
                    title="Eingabemaske dauerhaft löschen"
                    enterDelay={1500}
                >
                    <DeleteForeverIcon
                        fontSize="small"
                        sx={{
                            "&:hover": { color: theme.palette.error.main },
                        }}
                    />
                </Tooltip>
            </IconButton>
        </Toolbar>
    )
}
