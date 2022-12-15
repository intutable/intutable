import { InputMask } from "../types"
import { default as Proof_of_Concept_Table } from "./proof-of-concept-table"
import { default as Proof_of_Concept_View } from "./proof-of-concept-view"

const cache: InputMask[] = [Proof_of_Concept_Table, Proof_of_Concept_View]

export const getAll = () => cache
