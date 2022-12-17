import { InputMask } from "../types"

const mask: InputMask = {
    id: "804112D2-215A-4E52-8A54-AE1BCBE117F1",
    origin: {
        tableId: 1,
    },
    name: "PoC-Eingabemaske",
    description: "Dateneingabe via Eingabemaske als PoC",
    created: new Date(2022, 11, 15),
    lastEdited: new Date(2022, 11, 15),
    comments: [
        { text: "Hallo Welt", user: "Entwickler", created: new Date(2022, 11, 15) },
        { text: "Hallo Welt 2", user: "Entwickler", created: new Date(2022, 11, 15) },
        { text: "Hallo, am nächsten Tag!", user: "Admin", created: new Date(2022, 11, 16), highlighted: true },
        { text: "Hallo aus 2021", user: "Nutzer1", created: new Date(2021, 11, 15) },
        // {
        //     text: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
        //     user: "Nutzer2",
        //     created: new Date(2050, 09, 09),
        // }, // BUG: text too long,
        { text: "MEEEEEHHHHHRRR KOMMENTARE", user: "Nutzer2", created: new Date(2023, 11, 15) },
        { text: "MEEEEEHHHHHRRR KOMMENTARE", user: "Nutzer3", created: new Date(20237, 11, 15) },
        {
            text: "NNNOOOOOOOOCCCCCCCHHHHHHHHHH MEEEEEHHHHHRRR KOMMENTARE",
            user: "Nutzer4",
            created: new Date(20237, 11, 15),
        },
    ],
    active: true,
    groups: [],
    columnProps: [],
    rules: [],
}
export default mask
