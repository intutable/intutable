import type { NextPage } from "next"

import Title from "@components/Head/Title"
import Link from "@components/Link/Link"
import {
    Avatar,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from "@mui/material"
import { useAuth } from "@app/context/AuthContext"

const Home: NextPage = () => {
    const { user } = useAuth()

    if (!user)
        return (
            <Typography>
                Melde dich an: <Link href="/login">anmelden</Link>
            </Typography>
        )

    return (
        <>
            <Title title="Startseite" />
            <Typography>Hallo {user.username}!</Typography>
            <Divider />
            Hier findest du deine <Link href="/projects">Projekte</Link>.
            {/* Recent */}
            <Typography variant={"h5"} sx={{ mt: 20 }}>
                Letzte Tabellen
            </Typography>
            <Divider />
            <List
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "background.paper",
                }}
            >
                <ListItem>
                    <ListItemAvatar>
                        <Avatar>T</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Tabelle 1" secondary="Projekt 1" />
                </ListItem>
            </List>
        </>
    )
}

export default Home
