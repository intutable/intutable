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

    if (user == null || user.isLoggedIn === false)
        return (
            <Typography>
                Melde <Link href="/login">melden</Link> Sie sich an!
            </Typography>
        )

    return (
        <>
            <MetaTitle title="Startseite" />

            <Greeting variant="h4" />

            <Divider />
            <Typography sx={{ mt: 2 }}>
                Willkommen beim Verwaltungs-Tool der Fakultät für Mathematik und Informatik der
                Universität Heidelberg 🙋‍♂️
            </Typography>

            {/* Quick Links */}

            {/* <ReleaseNotification /> */}
        </>
    )
}

export default Home
