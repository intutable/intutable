import { Divider, Typography } from "@mui/material"
import { useUser } from "auth"
import { ErrorBoundary } from "components/ErrorBoundary"
import Title from "components/Head/Title"
import Link from "components/Link"
import type { NextPage } from "next"

const Home: NextPage = () => {
    const { user } = useUser()

    return (
        <>
            <Title title="Startseite" />
            <Typography variant={"h4"}>Startseite</Typography>
            <Divider />
            <ErrorBoundary
                fallback={
                    <span>Die Startseite konnte nicht geladen werden.</span>
                }
            >
                <Typography sx={{ mt: 2 }}>
                    {user?.isLoggedIn ? (
                        <>Hallo {user.username}!</>
                    ) : (
                        <>
                            Melde dich an: <Link href="/login">anmelden</Link>
                        </>
                    )}
                </Typography>
            </ErrorBoundary>
        </>
    )
}

export default Home
