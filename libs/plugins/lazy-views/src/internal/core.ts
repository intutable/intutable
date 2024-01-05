import { PluginLoader } from "@intutable-org/core"

let core: PluginLoader

export function setCore(newCore: PluginLoader): void {
    core = newCore
}
export function getCore(): PluginLoader {
    return core
}
