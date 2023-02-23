import { Do, ImplementsDo } from "../util/Do"
import { Alert } from "./Alert"

export const DoCtorMap = new Map<string, ImplementsDo>()
DoCtorMap.set(Alert.name, Alert)
