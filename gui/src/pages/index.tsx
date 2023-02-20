import { Divider, Typography } from "@mui/material"
import { useUser } from "auth"
import MetaTitle from "components/MetaTitle"
import Link from "components/Link"
import type { NextPage } from "next"
import { ReleaseNotification } from "components/Release Notes/ReleaseNotification"
import { useUserSettings } from "hooks/useUserSettings"
import { Greeting } from "components/Greeting"

const Home: NextPage = () => {
    const { user } = useUser()
    const { userSettings } = useUserSettings()

    return (
        <>
            <MetaTitle title="Startseite" />
            <Typography variant={"h4"}>Startseite</Typography>
            <Divider />
            <Typography sx={{ mt: 2 }}>
                {user?.isLoggedIn ? (
                    <Greeting />
                ) : (
                    <>
                        Melde dich an: <Link href="/login">anmelden</Link>
                    </>
                )}
            </Typography>

            {/* <ReleaseNotification /> */}
        </>
    )
}

export default Home
