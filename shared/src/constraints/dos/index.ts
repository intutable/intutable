import { Do, ImplementsDo } from "../util/Do"
import { Alert } from "./Alert"
import { ToggleState } from "./ToggleState"

export const DoCtorMap = new Map<string, ImplementsDo>()
DoCtorMap.set(Alert.name, Alert)
DoCtorMap.set(ToggleState.name, ToggleState)
