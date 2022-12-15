import { InputMask } from "../types"
import { default as Proof_of_Concept_Table } from "./proof-of-concept-table"
import { default as Proof_of_Concept_View } from "./proof-of-concept-view"

const cache: InputMask<"view" | "table">[] = [Proof_of_Concept_Table, Proof_of_Concept_View]

export const getAll = () => cache
export const getViewMasks = () => cache.filter(mask => mask.origin.__type === "view") as InputMask<"view">[]
export const getTableMasks = () => cache.filter(mask => mask.origin.__type === "table") as InputMask<"table">[]
