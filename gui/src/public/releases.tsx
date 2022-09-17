import { ReleaseProps } from "components/Release Notes/Release"

export const releases: ReleaseProps[] = [
    {
        version: "v1.0.0-alpha.1",
        prerelease: true,
        title: "Spalten-Typen & Filter",
        date: new Date("09/14/2022"),
        teaser: "Neue Spalten-Typen, verbesserte Filter und Bug-Fixes",
        description:
            "Die bisherigen Spalten-Typen 'Text' und 'E-Mail' wurden erweitert: 'Number', 'Time', 'Date', 'Boolean', 'Percentage', 'Currency', 'Hyperlink', 'Select' und 'Multi-Select' sind nun verfügbar. Die Filter wurden ebenfalls überarbeitet und bieten nun mehr Möglichkeiten. Außerdem wurden einige Bugs behoben.",
    },
    {
        version: "v0.1.0-alpha.3",
        prerelease: true,
        title: "1. Test-Version",
        date: new Date("07/04/2022"),
        teaser: "Eine erste Test-Version wurde im Prerelease für eine beschränkte Nutzergruppe zum Testen veröffentlicht.",
        description:
            "Basale Features können getestet werden. Filter, Tabellen bieten einige basale Funktionen.",
    },
    {
        version: "v0.1.0-alpha.2",
        prerelease: true,
        title: "2. MVP",
        date: new Date("06/09/2022"),
        teaser: "Zweite Präsentation der Applikation.",
        description:
            "Aufgrundlage der ersten Präsentation wurde die Applikation weiterentwickelt. Feedback und neue Requirements wurden in die Entwicklung einbezogen.",
    },
    {
        version: "v0.1.0-alpha.1",
        prerelease: true,
        title: "1. MVP",
        date: new Date("04/07/2022"),
        teaser: "Erste Präsentation der Applikation.",
        description:
            "Ein erster nicht-stabiler Prototyp der Applikation wurde zu Demo-Zwecken entwickelt.",
    },
]
