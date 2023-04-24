import { Alert, Box, Button, Divider, Paper, Tooltip, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import MetaTitle from "components/MetaTitle"
import { ReleaseList } from "components/Release Notes/ReleaseList"
import type { NextPage } from "next"
import { supportedFeatures } from "assets/supportedFeatures"
import SupportedFeatures from "components/SupportedFeatures"
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

            <CollapsableSection title="Schnelle Hilfe">
                <Alert severity="error" variant="filled">
                    Wir Entwickler entschuldigen uns für die Unannehmlichkeiten, die durch mögliche
                    Fehler in der Software entstanden sind. Wenn Sie schnelle Hilfe benötigen, dann
                    kontaktieren Sie uns bitte umgehend.
                </Alert>
                <ul>
                    <li>
                        Ticket eröffnen (langsam):{" "}
                        <a href="mailto:contact-project+intutable-dekanat-app-30881788-issue-@incoming.gitlab.com">
                            contact-project+intutable-dekanat-app-30881788-issue-@incoming.gitlab.com
                        </a>
                    </li>
                    <li>
                        Entwickler kontaktieren (dringend):{" "}
                        <a href="mailto:01faenge_notieren@icloud.com">
                            01faenge_notieren@icloud.com
                        </a>
                    </li>
                    <li>
                        Telefon (Notfall): Kontaktieren Sie einen der HiWis telefonisch, um
                        schnellste Hilfe zu erhalten!
                    </li>
                </ul>
            </CollapsableSection>

            <CollapsableSection title="Status zukünftiger Features" defaultClosed>
                <ul>
                    <li>
                        Hier sehen Sie eine Liste möglicher Features, die in Zukunft in die App
                        integriert werden.
                    </li>
                    <li>
                        Wenn Sie selbst eine Idee für ein neues Feature oder Änderungswünsche haben,
                        kontaktiern Sie uns gerne!
                    </li>
                </ul>
                <SupportedFeatures features={supportedFeatures} />
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
                <ReleaseList />
            </CollapsableSection>

            <CollapsableSection title="Wiki" defaultClosed>
                <ul>
                    <li>
                        <Button onClick={() => router.push("/wiki")}>Wiki</Button>
                    </li>
                </ul>
            </CollapsableSection>
        </>
    )
}

export default ServiceDesk
