import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Mismatch } from "@shared/constraints/util/Mismatch"
import { useState } from "react"

export const DebugMismatch: React.FC<{ mismatch: Mismatch & { constraint: string } }> = ({
    mismatch,
}) => {
    const theme = useTheme()

    const [collapsed, setCollapsed] = useState<boolean>(true)
    const toggleCollapsed = () => setCollapsed(prev => !prev)

    const label =
        mismatch.severity === "error"
            ? "schwerwiegend"
            : mismatch.severity === "warning"
            ? "mismatch"
            : "hinweis"

    return (
        <Box
            sx={{
                borderRadius: theme.shape.borderRadius,
                // bgcolor: theme.palette.error.main,
                p: 2,
                mt: 1,
                overflowWrap: "break-word",
                width: 1,
                cursor: "pointer",
            }}
            onClick={toggleCollapsed}
            component={Paper}
        >
            <Stack direction="column">
                <Stack direction="row" flexWrap="nowrap">
                    <Typography
                        variant="subtitle2"
                        sx={{
                            overflow: "clip",
                        }}
                    >
                        {mismatch.title}
                    </Typography>
                    <Box flexGrow={1} />
                    <Chip label={label} size="small" variant="outlined" color={mismatch.severity} />
                </Stack>
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.action.disabled,
                    }}
                >
                    {mismatch.constraint}
                </Typography>
            </Stack>

            {collapsed === false && (
                <>
                    <Box marginTop={3}>
                        <Divider>
                            <Typography variant="overline">Beschreibung</Typography>
                        </Divider>
                        <Typography
                            variant="body2"
                            fontSize="small"
                            color="text.secondary"
                            marginTop={0.5}
                        >
                            {mismatch.message}
                        </Typography>
                    </Box>

                    <Box marginTop={6}>
                        <Divider>
                            <Typography variant="overline">Behebung</Typography>
                        </Divider>

                        <Typography
                            variant="body2"
                            fontSize="small"
                            color="text.secondary"
                            marginTop={0.5}
                        >
                            {mismatch.howToSolve}
                        </Typography>
                    </Box>
                </>
            )}
        </Box>
    )
}
