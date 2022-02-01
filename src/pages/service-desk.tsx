import type { NextPage } from "next"
import Title from "@components/Head/Title"
import { Divider, Typography, Box, useTheme, IconButton } from "@mui/material"
import Link from "@components/Link/Link"

const ServiceDesk: NextPage = () => {
    const theme = useTheme()
    return (
        <>
            <Title title="Service Desk" />
            <Typography variant={"h4"}>Service Desk</Typography>
            <Divider />

            {/* Bugs & Feature-Requests */}
            <Typography variant={"h5"} sx={{ mt: 20 }}>
                Bugs und Feature-Requests
            </Typography>
            <Divider />
            <ul>
                <li>
                    <Typography>
                        Bugs oder Feature-Requests können mit einer
                        detaillierten Beschreibung an diese{" "}
                        <a href="mailto:contact-project+intutable-dekanat-app-30881788-issue-@incoming.gitlab.com">
                            E-Mail
                        </a>{" "}
                        gesendet werden. Die Entwickler erhalten eine Nachricht
                        und kümmern sich darum.
                    </Typography>
                </li>
            </ul>

            {/* Caveats */}
            <Typography variant={"h5"} sx={{ mt: 20 }}>
                Caveats
            </Typography>
            <Divider />
            <ul>
                <li>
                    <Typography
                        sx={{
                            color: theme.palette.text.secondary,
                        }}
                    >
                        Safari wird zzt. als Browser nicht vollständig
                        unterstützt. Wir empfehlen Google Chrome.
                    </Typography>
                </li>
                <li>
                    <Typography
                        sx={{
                            color: theme.palette.text.secondary,
                        }}
                    >
                        Die App ist zzt. nicht für mobile Endgeräte optimiert.
                    </Typography>
                </li>
            </ul>

            {/* Versionsverlauf */}
            <Typography variant={"h5"} sx={{ mt: 20 }}>
                Versionsverlauf
            </Typography>
            <Divider />
            <ul>
                <li>
                    <Typography
                        sx={{
                            color: theme.palette.text.secondary,
                        }}
                    >
                        <Link href="/versionhistory/000">0.0.0</Link> vom
                        xx.xx.2022
                    </Typography>
                </li>
            </ul>
        </>
    )
}

export default ServiceDesk
