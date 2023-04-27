_Diese Wiki-Seite ist für Entwickler und Content-Ersteller. Zusätzlich sollte der Code konsultiert werden._

## Was sind Eingabemasken?

Eingabemasken erweitern die Möglichkeiten gewöhnlicher Tabellen.

## Eingabemasken erstellen (für **Content-Ersteller**)

Eingabemasken müssen zzt. noch händisch im Quellcode angelegt werden.[^1] (1) Unter `/shared/src/input-masks/database/*` kann eine `.ts`-Dateo hinzugefügt und in dieser die Eingabemaske spezifiziert werden. (2) Das exportierte Objekt muss anschließend in `/shared/src/input-masks/database/index.ts` dem `cache` hinzugefügt werden. Nach einem neuen Builden steht die Eingabemaske bereit.

[^1]: (_Ein UI für das Verwalten und Editieren von Eingabemasken wurde vorbereitet und kann – wenn gewünscht – schnell implementiert werden._)

### Typ `InputMask`

Das Grundlegende ist die Eingabemaske, die aus folgenden Eigenschaften besteht:

-   `id`: Identifiziert die Eingabemaske eindeutig. Eine uuid-v4 eignet sich am besten (kann bspw. mit `uuid` resp. `uuidgen` generiert werden).
-   `origin`: Bindet die Eingabemasken entweder an eine einzelne View oder eine gesamte Tabelle (resp. alle Views). Im besten Fall ist die ID bekannt und wird hier übergeben. Zu Testzweck genügt der Name der Tabelle oder View (siehe Details im Code).
-   `name`: Der Name der Eingabemaske. Wird an verschiedenen Stellen im UI angezeigt.
-   `description`: Eine mehrere Sätze umfassende Beschreibung der Eingabemaske (etwa: Motivation, Verwendungszweck, etc.).
-   `lastEdited`: Datum der letzten Bearbeitung der Eingabemaske (_ungenutzt, reserviert für spätere Zwecke_).
-   `comments`: Werden in einem ein-/ausschaltbaren Kommentarbereich neben der Eingebmaske angezeigt. Zurzeit pro Eingabemaske, statt pro Eintrag/Zeile. Deshalb vielmehr Hinweis als Kommentar. (_Kann bei Bedarf ausgebaut werden._)
-   `active`: Filtert die Eingabemaske bereits im Backend heraus. Nützlich, wenn die Eingabemaske bspw. noch nicht fertig ist und redigiert werden muss.
-   `disabled?` (optional): Deaktiviert die Eingabemaske im Frontend. Sie wird anders als bei `active` angezeigt aber als »inaktiv« deklariert.
-   ~~`eligible?`~~ (optional): _Nicht implementiert (für Permissions reserviert)._
-   `addRecordButtonText?` (optional): Wird für verschiende Call-to-Action-Buttons verwendet (Bsp. »Neue Person hinzufügen«).
-   `addRecordButtonIcon?` (optional): Ein zusätzliches Icon für den Call-to-Action-Button. Aus den [Material Icons](https://fonts.google.com/icons) kann eines gewählt werden. Dazu muss der eindeutige Name des Icons hier angegeben werden (bspw. für das Search-Icon `search`. Diese Bezeichnung steht auf der angegebenen Website).
-   `draftsCanBeDeleted?` (optional): Einträge können standardmäßig nur durch Admins gelöscht werden. Andere Nutzergruppen können aber Einträge anlegen. Damit irrtümlich angelegte Einträge gelöscht werden können, kann die Option aktiviert werden. Das erlaubt dem Nutzer unmittelbar nach Erstellung eines neuen Eintrags diesen zu löschen (”Entwurf”).
-   `groups`: Mehrere Spalten werden gruppiert (siehe unten: »Spalten-Gruppen«)
-   `columnProps`: Eigenschaften für einzelne Spalten (siehe unten: »Spalten-Eigenschaften«)
-   `components`: Zusätzliche Komponenten, die in der Eingabemaske verwendet werden können(siehe unten: »Komponenten«)
-   `constraints`: Constraints werden hier spezifiziert, besitzen aber eine eigene Wiki-Seite: [Constraints (Technical Documentation)](/wiki/constraints-technical-documentation) oder [Constraints (User Guide)](wiki/how-to-constraints)

### Komponenten

-   `Divider`:
-   `Note`:

### Zusätzliche Spalten-Eigenschaften

-   `inputRequired?`: (optional) (default `false`)
-   `tooltip?`: (optional)
-   `inputPlaceholderText?`: (optional)
-   `suppressInputLabel?`: (optional) (default `false`)
-   `disallowNewSelectValues?`: (optional) (default `false`)
-   `defaultValue?`: (optional)

Außerdem können einige Standard-Spalten-Eigenschaften überschrieben werden (siehe `OverrideableColumnProps` [sic!]).

### Spalten-Gruppen

In Eingabemasken sind es weniger Spalten-Gruppen als gruppierte Eingabefelder. Bsp.: Adress- oder Namensfeld (verschiedene Spalten »Titel«, »Vorname« und »Nachname« werden zusammengefasst).

-   `label`:
-   `tooltip?`: (optional)
-   `index`:
-   `collapsable?` [sic!] : (optional) (default `false`)
-   `collapsed?`: (optional) (default `false`)
-   `columns`:

## Technische Details

Eingabemasken sind kein unabhängiges Feature, sondern nur eine Erweiterung jeder Tabelle. Da sie technisch auf diesen aufbauen, sind den Möglichkeiten Grenzen gesetzt.

_Zuletzt editiert: April 2023_
