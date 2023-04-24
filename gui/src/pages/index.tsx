import { Alert, Box, Divider, Typography } from "@mui/material"
import { useUser } from "auth"
import MetaTitle from "components/MetaTitle"
import Link from "components/Link"
import type { NextPage } from "next"
import { ReleaseNotification } from "components/Release Notes/ReleaseNotification"
import { useUserSettings } from "hooks/useUserSettings"
import { Greeting } from "components/Greeting"
import Image from "next/image"
import { useTheme } from "@mui/material/styles"
import { QuickLinks } from "components/QuickLinks"
import { IncompleteUserSettingsWarning } from "components/IncompleteUserSettingsWarning"

const Home: NextPage = () => {
    const { user } = useUser()
    const { userSettings } = useUserSettings()
    const theme = useTheme()

    const BG = (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) scale(1.8)",
                opacity: 0.4,
                width: "30%",
                height: "30%",
                // filter: "blur(px)",
            }}
        >
            {theme.palette.mode === "dark" ? (
                <Image
                    src="/logo/logo-de-white.svg"
                    alt="Logo der Fakultät für Mathematik und Informatik der Universität Heidelberg"
                    layout="fill"
                    objectFit="contain"
                    priority
                    // placeholder="blur"
                />
            ) : (
                <Image
                    src="/logo/logo-de.svg"
                    alt="Logo der Fakultät für Mathematik und Informatik der Universität Heidelberg"
                    layout="fill"
                    objectFit="contain"
                    priority
                    // placeholder="blur"
                />
            )}
        </Box>
    )

    if (user == null || user.isLoggedIn === false)
        return (
            <>
                <Typography>
                    Bitte <Link href="/login">melden</Link> Sie sich an!
                </Typography>
                {BG}
                <QuickLinks />
            </>
        )

    return (
        <>
            <MetaTitle title="Startseite" />

            <Greeting variant="h4" />

            <Divider />
            <Typography sx={{ mt: 3 }}>
                Willkommen beim Verwaltungs-Tool der Fakultät für Mathematik und Informatik der
                Universität Heidelberg 🙋‍♂️
            </Typography>

            {BG}

            {/* Quick Links */}
            <QuickLinks />

            {/* <ReleaseNotification /> */}
        </>
    )
}

export default Home
