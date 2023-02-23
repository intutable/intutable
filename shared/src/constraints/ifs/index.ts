import { ImplementsIf } from "../util/If"
import { AlwaysFalse } from "./AlwaysFalse"
import { AlwaysTrue } from "./AlwaysTrue"

export const IfCtorMap = new Map<string, ImplementsIf>()
IfCtorMap.set(AlwaysTrue.name, AlwaysTrue)
IfCtorMap.set(AlwaysFalse.name, AlwaysFalse)
