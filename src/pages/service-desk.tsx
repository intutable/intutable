import { Divider, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import MetaTitle from "components/MetaTitle"
import { ReleaseList } from "components/Release Notes/ReleaseList"
import type { NextPage } from "next"

const ServiceDesk: NextPage = () => {
    const theme = useTheme()
    return (
        <>
            <MetaTitle title="Service Desk" />
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
                        und werden das Problem so schnell wie möglich lösen.
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

            <ReleaseList />
        </>
    )
}

export default ServiceDesk
