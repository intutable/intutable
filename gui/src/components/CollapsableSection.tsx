import { Badge, BadgeTypeMap, Box, Divider, IconButton, Stack, Typography } from "@mui/material"
import React, { useState } from "react"

import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown"

export type CollapsableSectionProps = {
    children: React.ReactNode
    title: string
    /** @default true */
    defaultClosed?: boolean
    badgeCount?: number
    badgeColor?: BadgeTypeMap["props"]["color"]
}

export const CollapsableSection: React.FC<CollapsableSectionProps> = props => {
    const [collapsed, setCollapsed] = useState<boolean>(props.defaultClosed === true)

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
                <Badge
                    badgeContent={collapsed === false ? undefined : props.badgeCount ?? 0}
                    color={props.badgeColor ?? "default"}
                >
                    <Typography variant="h5" component="h2">
                        {props.title}
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
