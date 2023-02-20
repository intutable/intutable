import Expand from "@mui/icons-material/ExpandMore"
import { Box, Divider, List, ListSubheader, Paper, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useState } from "react"

export const CollapsableListDivider: React.FC = () => <Divider sx={{ my: 2 }} variant="middle" />

export type CollapsableListProps = {
    label: string
    description?: string
    children: React.ReactNode
}

export const CollapsableList: React.FC<CollapsableListProps> = props => {
    const theme = useTheme()
    const [collapsed, setCollapsed] = useState<boolean>(true)

    return (
        <List
            dense
            sx={{
                width: "100%",
                maxWidth: 360,
                mt: 5,
            }}
            subheader={
                <ListSubheader>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                        <Expand
                            onClick={() => setCollapsed(prev => !prev)}
                            fontSize="small"
                            sx={{
                                cursor: "pointer",
                                transform: collapsed ? "rotate(-90deg)" : undefined,
                            }}
                        />
                        <Typography variant="subtitle1" fontSize="large">
                            {props.label}
                        </Typography>
                    </Stack>
                </ListSubheader>
            }
        >
            <Box
                sx={{
                    pl: 5,
                }}
            >
                {collapsed && props.description && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: theme.palette.action.disabled,
                        }}
                    >
                        {props.description}
                    </Typography>
                )}
                {collapsed === false && (
                    <Paper elevation={0} variant="outlined" sx={{ mt: 1, p: 1 }}>
                        {props.children}
                    </Paper>
                )}
            </Box>
        </List>
    )
}