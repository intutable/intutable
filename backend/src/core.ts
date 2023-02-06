import { Core } from "@intutable/core"

let core: Core

export function setCore(newCore: Core) {
    core = newCore
}

export function getCore() {
    return core
}
