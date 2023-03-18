import { Do, ImplementsDo } from "../util/Do"
import { Snack } from "./Snack"
import { ToggleState } from "./ToggleState"

export const DoCtorMap = new Map<string, ImplementsDo>()
DoCtorMap.set(Snack.name, Snack)
DoCtorMap.set(ToggleState.name, ToggleState)
