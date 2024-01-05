import { InputMask } from "../types"
import { default as Persons } from "./personen-eingabmaske"
// this is just some code that imitates a database, one day input masks may be saved in a real db

const cache: InputMask[] = [Persons]

/** Get all input masks */
export const getAll = () => cache.filter(mask => mask.active)
