import { InputMask } from "../../types"
import Original from "./personen-eingabmaske"

const mask: InputMask = {
    ...Original,
    id: "DA687CD1-7527-4412-B6DB-25D11B75866E",
    name: "Personen-Eingabemaske (Fehler-Test)",
    constraints: [
        // {
        //     name: "Proof-of-Concept 2",
        //     id: "014629F7-9CA1-40DA-B69C-36560FAA483B",
        //     __type: "constraint",
        //     conditions: {
        //         __type: "node",
        //         __ctor: "Node",
        //         data: { __type: "if", __ctor: "Timeout", __props: [12000] },
        //         next: null,
        //     },
        //     executments: [],
        // },
        // {
        //     name: "Proof-of-Concept",
        //     id: "AF1620FC-DEFA-4207-987B-FE0EA3D9D5BD",
        //     __type: "constraint",
        //     conditions: {
        //         __type: "node",
        //         __ctor: "Node",
        //         data: { __type: "if", __ctor: "AlwaysFalse" },
        //         next: null,
        //     },
        //     executments: [],
        // },
        // {
        //     name: "Proof-of-Concept 2",
        //     id: "CF950B9A-7370-49B4-AEA4-BA5CEEB86250",
        //     __type: "constraint",
        //     conditions: {
        //         __type: "node",
        //         __ctor: "Node",
        //         data: { __type: "if", __ctor: "Timeout", __props: [12000] },
        //         next: null,
        //     },
        //     executments: [],
        // },
    ],
}
export default mask
