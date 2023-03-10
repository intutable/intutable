import { InputMask } from "../../types"
import Original from "./personen-eingabmaske"

const mask: InputMask = {
    ...Original,
    id: "DA687CD1-7527-4412-B6DB-25D11B75866E",
    name: "Personen-Eingabemaske (Fehler-Test)",
    constraints: [
        {
            name: "Proof-of-Concept 2",
            __type: "constraint",
            __ctor: "Constraint",
            conditions: {
                __type: "node",
                __ctor: "Node",
                data: { __type: "if", __ctor: "Timeout", __props: [12000] },
                next: null,
            },
            executments: [],
        },
        {
            name: "Proof-of-Concept",
            __type: "constraint",
            __ctor: "Constraint",
            conditions: {
                __type: "node",
                __ctor: "Node",
                data: { __type: "if", __ctor: "AlwaysFalse" },
                next: null,
            },
            executments: [],
            debugMessage: {
                title: "Test-Fehler",
                severity: "error",
                message:
                    "Dieses Constraint ist immer falsch und sollte eine Fehlermeldung ausgeben.",
                howToSolve:
                    "Dies ist ein Test, um zu sehen, ob die Fehlermeldung korrekt angezeigt wird.",
            },
        },
        {
            name: "Proof-of-Concept 2",
            __type: "constraint",
            __ctor: "Constraint",
            conditions: {
                __type: "node",
                __ctor: "Node",
                data: { __type: "if", __ctor: "Timeout", __props: [12000] },
                next: null,
            },
            executments: [],
        },
    ],
}
export default mask
