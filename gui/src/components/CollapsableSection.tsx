import { Box, Divider, IconButton, Stack, Typography } from "@mui/material"
import React, { useState } from "react"

import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown"

export type CollapsableSectionProps = {
    children: React.ReactNode
    title: string
}

export const CollapsableSection: React.FC<CollapsableSectionProps> = props => {
    const [collapsed, setCollapsed] = useState<boolean>(false)

    return (
        <Box
            sx={{
                my: 5,
            }}
        >
            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    width: "100%",
                }}
            >
                <Typography variant="h5" component="h2">
                    {props.title}
                </Typography>
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
            <Divider />
            {collapsed === false && (
                <Box
                    sx={{
                        mt: 2,
                        p: 3,
                    }}
                >
                    {props.children}
                </Box>
            )}
        </Box>
    )
}
