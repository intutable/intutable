import { ReleaseProps } from "components/Release Notes/Release"

export const releases: ReleaseProps[] = [
    {
        version: "v0.1.0-alpha.3",
        prerelease: true,
        title: "Alpha Testing",
        date: new Date("07/01/2022"),
        teaser: "Diese nicht öffentliche Version ist der erste Pre-Release der App und enthält mehrere Features. Die App ist noch in der Entwicklung und wird weiterhin weiterentwickelt, sodass es u.a. zu unerwarteten Fehlern kommen kann. Einige der Features funktionieren möglicherweise nicht wie erwartet. Bugs bitten wir über die »Report-A-Bug«-Funktion mit einer detaillirten Beschreibung zu melden, damit diese unmgehend von den Entwicklern behoben werden können.",
        description: "Tabellen",
    },
    {
        version: "v0.1.0-alpha.2",
        prerelease: true,
        title: "MVP Juni",
        date: new Date("06/09/2022"),
        teaser: "Zweite Präsentation der App",
        description: "",
    },
    {
        version: "v0.1.0-alpha.1",
        prerelease: true,
        title: "MVP April",
        date: new Date("04/07/2022"),
        teaser: "Erste Präsentation der App",
        description: "",
    },
]
