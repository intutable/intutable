import { Alert, Box, Button, Divider, Paper, Tooltip, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import MetaTitle from "components/MetaTitle"
import type { NextPage } from "next"
import { CollapsableSection } from "components/CollapsableSection"
import { Router, useRouter } from "next/router"

const ServiceDesk: NextPage = () => {
    const router = useRouter()
    const theme = useTheme()
    return (
        <>
            <MetaTitle title="Service Desk" />
            <Typography variant={"h4"}>Service Desk</Typography>
            <Divider />

            <CollapsableSection title="Support">
                <Typography marginBottom={2}>Bitte kontaktieren Sie uns bei Problemen.</Typography>
                <ul>
                    <li>
                        Schreiben Sie uns eine Mail:{" "}
                        <a href="mailto:contact-project+intutable-dekanat-app-30881788-issue-@incoming.gitlab.com">
                            contact-project+intutable-dekanat-app-30881788-issue-@incoming.gitlab.com
                        </a>
                    </li>
                </ul>
            </CollapsableSection>

            <CollapsableSection title="Bekannte Bugs" defaultClosed>
                <Typography marginBottom={2}>
                    In der folgenden Liste sind bekannte Fehler aufgelistet, die wir in Kürze
                    beheben werden!
                </Typography>
                <Alert severity="warning">
                    Wenn Sie einen Bug entdeckt haben, der hier nicht aufgeführt ist, schreiben Sie
                    bitte eine E-Mail an diese{" "}
                    <a href="mailto:contact-project+intutable-dekanat-app-30881788-issue-@incoming.gitlab.com">
                        Adresse
                    </a>
                    . Damit wir den Fehler schnellstmöglich beheben können, beschreiben Sie bitte
                    den aufgetreten Fehler sowie die Schritte, die Sie durchgeführt haben, um den
                    Fehler zu reproduzieren. Außerdem benötigen wir Informationen über Ihren Browser
                    und Betriebssystem.
                </Alert>
                <ul>
                    <li>
                        Einige Features könnten in manchen Browsern nicht unterstüzt sein. Wir
                        empfehlen Google Chrome. Installieren Sie möglichst die neuste Version Ihres
                        Browsers!
                    </li>
                    <li>Die App ist nicht für mobile Endgeräte optimiert.</li>
                    <li>
                        Gelegentlich tritt ein unerwarteter Fehler auf, der es verhindert, innerhalb
                        der Kontext-Menüs zu klicken. Für diesen Fehler ist leider eine
                        Drittanbieter-Software verantwortlich. Wir arbeiten an einer Lösung.
                        Mithilfe der Tastatur können Sie die Menüs dennoch navigieren und klicken
                        (Pfeiltasten, Enter).
                    </li>
                </ul>
            </CollapsableSection>

            <CollapsableSection title="Versionsverlauf" defaultClosed>
                <Button onClick={() => router.push("/changelog")}>
                    Änderungsprotokoll (CHANGELOG)
                </Button>
            </CollapsableSection>
        </>
    )
}

export default ServiceDesk
