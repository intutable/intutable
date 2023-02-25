import { InputMask } from "../types"
import { default as Proof_of_Concept_Table } from "./personen-eingabmaske"
import { default as Proof_of_Concept_Table_Error } from "./personen-eingabmaske-fehler"
import { default as Proof_of_Concept_View } from "./institut-personen-eingabemaske"
import { default as DISABLED_TEST } from "./eingabmaske-disabled"

// this is just some code that imitates a database, one day input masks may be saved in a real db

const cache: InputMask[] = [
    Proof_of_Concept_Table,
    Proof_of_Concept_View,
    DISABLED_TEST,
    Proof_of_Concept_Table_Error,
]

/** Get all input masks */
export const getAll = () => cache as unknown as InputMask[]
