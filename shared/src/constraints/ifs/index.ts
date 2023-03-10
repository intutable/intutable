import { ImplementsIf } from "../util/If"
import { AlwaysFalse } from "./AlwaysFalse"
import { AlwaysTrue } from "./AlwaysTrue"
import { Throw } from "./Throw"
import { Timeout } from "./Timeout"

export const IfCtorMap = new Map<string, ImplementsIf>()
IfCtorMap.set(AlwaysTrue.name, AlwaysTrue)
IfCtorMap.set(AlwaysFalse.name, AlwaysFalse)
IfCtorMap.set(Timeout.name, Timeout)
IfCtorMap.set(Throw.name, Throw)
