import { Alert, Box, Divider, Typography } from "@mui/material"
import { useUser } from "auth"
import MetaTitle from "components/MetaTitle"
import Link from "components/Link"
import type { NextPage } from "next"
import { ReleaseNotification } from "components/Release Notes/ReleaseNotification"
import { useUserSettings } from "hooks/useUserSettings"
import { Greeting } from "components/Greeting"
import Image from "next/image"
import LogoWhite from "public/logo/logo-de-white.svg"
import LogoDark from "public/logo/logo-de.svg"
import { useTheme } from "@mui/material/styles"
import { QuickLinks } from "components/QuickLinks"

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
                // filter: "blur(px)",
            }}
        >
            <Image
                src={theme.palette.mode === "dark" ? LogoWhite : LogoDark}
                alt="Logo der Fakultät für Mathematik und Informatik der Universität Heidelberg"
            />
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

            {(userSettings?.firstName === "" ||
                userSettings?.lastName === "" ||
                userSettings?.sex === "") && (
                <Alert severity="warning" sx={{ mb: 6 }}>
                    Sie haben noch nicht alle persönlichen Daten angegeben. Bitte vervollständigen
                    Sie diese unter{" "}
                    <Link href="/settings">Einstellungen &#8250; Benutzerkonto</Link>.
                </Alert>
            )}

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
