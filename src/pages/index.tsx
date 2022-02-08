import type { NextPage } from "next"

import Title from "@components/Head/Title"
import Link from "@components/Link/Link"
import { Divider, Typography } from "@mui/material"
import { useAuth } from "@app/context/AuthContext"

const Home: NextPage = () => {
    const { user } = useAuth()
    return (
        <>
            <Title title="Startseite" />
            {user ? (
                <>
                    <Typography>Hallo {user.username}!</Typography>
                    <Divider />
                    Hier findest du deine <Link href="/projects">Projekte</Link>
                    .
                </>
            ) : (
                <Typography>
                    Melde dich an: <Link href="/login">anmelden</Link>
                </Typography>
            )}
        </>
    )
}

export default Home
