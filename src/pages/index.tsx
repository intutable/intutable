import { Divider, Typography } from "@mui/material"
import Title from "components/Head/Title"
import Link from "components/Link"
import { useAuth } from "context"
import type { NextPage } from "next"

const Home: NextPage = () => {
    const { user } = useAuth()
    return (
        <>
            <Title title="Startseite" />
            <Typography variant={"h4"}>Startseite</Typography>
            <Divider />
            <Typography sx={{ mt: 2 }}>
                {user ? (
                    <>Hallo {user.username}!</>
                ) : (
                    <>
                        Melde dich an: <Link href="/login">anmelden</Link>
                    </>
                )}
            </Typography>
        </>
    )
}

export default Home
