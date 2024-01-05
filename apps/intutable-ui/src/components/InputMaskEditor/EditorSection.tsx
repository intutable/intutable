import { Box, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown"
import { Badge, IconButton } from "@mui/material"
import React, { useState } from "react"

export const EditorSection: React.FC<{ children: React.ReactNode; label: React.ReactNode }> = ({
    children,
    label,
}) => {
    const theme = useTheme()
    const [collapsed, setCollapsed] = useState<boolean>(true)
    const errors = 0
    return (
        <Box
            sx={{
                bgcolor: "inherit",
                "&:hover": {
                    bgcolor: theme.palette.action.hover,
                },
                borderRadius: theme.shape.borderRadius,
                mb: 3,
                px: 3,
                py: 2,
                boxSizing: "border-box",
            }}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    width: "100%",
                    mb: collapsed ? 0 : 3,
                }}
            >
                <Badge
                    badgeContent={errors}
                    color="error"
                    invisible={collapsed === false || errors === 0}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mr: 0.5,
                        }}
                        color={errors > 0 ? "error" : "text.primary"}
                    >
                        {label}
                    </Typography>
                </Badge>
                <Box flexGrow={1} />

                <IconButton size="small" onClick={() => setCollapsed(prev => !prev)}>
                    <ExpandCircleDownIcon
                        fontSize="small"
                        sx={{
                            transform: collapsed ? undefined : "rotate(180deg)",
                        }}
                    />
                </IconButton>
            </Stack>

            {collapsed === false && <Box>{children}</Box>}
        </Box>
    )
}
