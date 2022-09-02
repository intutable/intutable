import { Feature } from "components/Wiki/SupportedFeatures"

export const supportedFeatures: Feature[] = [
    {
        name: "Filter für Tabellen",
        infoText:
            "Boolsche Filter für ganze Tabellen resp. Views (bspw. wenn X gleich Y, dann zeige diese Daten)",
        support: "in-testing",
        release: "v0.1.0-alpha.3",
    },
    {
        name: "Sortieren & Suchen",
        infoText:
            "Sortieren von Spalten (bspw. alphabetisch, abfolgend etc.) und textbasierte Suchen in Spalten",
        support: "unsupported",
    },
    {
        name: "Views",
        infoText: "",
        support: "supported",
        release: "v0.1.0-alpha.2",
    },
    {
        name: "Import von Daten",
        infoText: "Daten in eine Tabelle importien",
        support: "unsupported",
    },
    {
        name: "Export von Daten",
        infoText: "Partielle Daten in verschiedene Formate exportieren",
        support: "in-testing",
        release: "v0.1.0-alpha.3",
    },
    {
        name: "Dark Mode",
        infoText: "Dunkles Erscheinungsbild der App",
        support: "in-development",
    },
    {
        name: "User Permissions",
        infoText: "Verschiedene Benutzerberechtigungen und Rollen",
        support: "in-development",
    },
]
