import { readFile } from "fs/promises"
import { EventSystem } from "../events"
import { join as joinPath } from "path"
import { PluginLoader } from "./PluginLoader"
import { Plugin, PluginInfo, PluginModule } from "./Plugin"
import { PluginHandle } from "./PluginHandle"
import glob from "glob"

export let pluginLoader: PluginLoader

/**
 * @param paths List of glob patterns
 */
export async function loadPlugins(patterns: string[], events: EventSystem): Promise<PluginHandle> {
    const plugins: Plugin[] = []

    pluginLoader = new PluginLoader(events)

    const pluginFolder = patterns.flatMap(
        pattern => glob.sync(pattern, { cwd: joinPath(__dirname, "../../../.."), absolute: true }) // TODO: do not do it this way
    )

    console.log("plugins:", pluginFolder)

    const pluginInfos = await loadPluginInfos(pluginFolder, events).then(infos =>
        sortByDependencies(infos)
    )

    for (const pluginInfo of pluginInfos) {
        await loadPlugin(pluginInfo, pluginLoader)
            .then(plugin => plugins.push(plugin))
            .catch(err => onPluginLoadError(events, pluginInfo, err))
    }

    return new PluginHandle(plugins)
}

async function loadPluginInfos(pluginPaths: string[], events: EventSystem): Promise<PluginInfo[]> {
    const results: PluginInfo[] = []

    for (const path of pluginPaths) {
        const packageJson = joinPath(path, "package.json")

        await readFile(packageJson)
            .then(content => content.toString())
            .then(JSON.parse)
            .then(packageJson => ({
                name: packageJson.name,
                dependencies: packageJson.dependencies,
                path
            }))
            .then(info => results.push(info))
            .catch(err => {
                onPluginLoadError(events, { path } as PluginInfo, err) // TODO: use 'satisfies' instead of 'as'
            })
    }

    return results
}

function sortByDependencies(pluginInfos: PluginInfo[]): PluginInfo[] {
    return pluginInfos.sort((a, b) => {
        if (!b.dependencies) {
            return 1
        }

        if (a.name in b.dependencies) {
            return -1 // a depends on b, put b first
        } else {
            // keep the order as is, either b depends on a
            // or they dont depend on each other
            return 1
        }
    })
}

function onPluginLoadError(
    events: EventSystem,
    pluginInfo: PluginInfo,
    err: { code: string; message: string }
) {
    switch (err.code) {
        case "NO_INIT":
            events.notify({ channel: "core", method: "plugin-load-error", ...err })
            break
        case "ENOENT":
            events.notify({
                channel: "core",
                method: "plugin-load-error",
                message: `the folder ${pluginInfo.path} does not contain a correct package.json and is ignored`
            })
            break
        default:
            events.notify({
                channel: "core-plugin",
                method: "plugin-load-error",
                ...err,
                message: `an unexpected error occured while trying to load the plugin at ${pluginInfo.path}: ${err.message}`
            })
    }
}

async function loadPlugin(pluginInfo: PluginInfo, pluginLoader: PluginLoader): Promise<Plugin> {
    const module = await initializePlugin(pluginInfo.path, pluginLoader)

    return {
        info: pluginInfo,
        module
    }
}

async function initializePlugin(
    pluginPath: string,
    pluginLoader: PluginLoader
): Promise<PluginModule> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(pluginPath)
    if (!module.init) {
        return Promise.reject({
            code: "NO_INIT",
            message: `the module at ${pluginPath} has no init function`
        })
    } else {
        await module.init(pluginLoader)
        return module
    }
}
