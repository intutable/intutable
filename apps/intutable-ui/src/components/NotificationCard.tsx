import React, { useEffect, useRef, useState } from "react"
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material"
import PostAddIcon from "@mui/icons-material/PostAdd"
import { NotificationItem } from "@intutable-org/process-manager/dist/types"
import { useWorkflow } from "hooks/useWorkflow"

const NotificationCard = (props: { type: string }) => {
    const [isLoading, setLoading] = useState(false)
    const { getItemsForUser } = useWorkflow()
    const [openItems, setOpenItems] = useState<NotificationItem[]>([])
    const dataFetchedRef = useRef(false)
    const isDeansOffice = () => {
        // TODO: Adjust for multiple users
        return props.type === "deansOffice"
    }
    const isProfessor = () => {
        // TODO: Adjust for multiple users
        return props.type === "professor"
    }

    async function fetchData() {
        setLoading(true)

        const openItems = await getItemsForUser()
        setOpenItems(openItems)

        setLoading(false)
    }

    useEffect(() => {
        if (dataFetchedRef.current) {
            return
        }
        dataFetchedRef.current = true
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <Card sx={{ maxWidth: "500px" }}>
                {isDeansOffice() && <CardHeader title="ToDos" subheader="Sekretariatsansicht" />}
                {isProfessor() && <CardHeader title="ToDos" subheader="Professoransicht" />}
                <CardContent>
                    {isLoading ? (
                        <Box sx={{ m: 2, display: "flex" }}>
                            <CircularProgress sx={{ mr: 2 }} />
                            <Typography variant="h6">Wird geladen ...</Typography>
                        </Box>
                    ) : (
                        <List>
                            {openItems.length ? (
                                openItems.map((item: NotificationItem, index: number) => {
                                    return (
                                        <ListItem
                                            key={`notification-listitem-${index}`}
                                            disablePadding
                                        >
                                            <ListItemButton>
                                                {" "}
                                                {/* TODO: onclick */}
                                                <ListItemIcon>
                                                    <PostAddIcon />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item.workflow}
                                                    secondary={item.nextSteps
                                                        .map(item => item.name)
                                                        .join("\n")}
                                                    secondaryTypographyProps={{
                                                        style: { whiteSpace: "pre-line" },
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    )
                                })
                            ) : (
                                <ListItem>
                                    <ListItemText primary={"Aktuell gibt es keine ToDos 🥳."} />
                                </ListItem>
                            )}
                        </List>
                    )}
                </CardContent>
            </Card>
        </>
    )
}

export default NotificationCard
