import { EventSystem } from "./events"
import { loadPlugins, PluginHandle } from "./plugins"

export * from "./plugins"
export * from "./events"
export * from "./middleware"
export {startHttpServer} from "./http/http"

export class Core {
    events: EventSystem
    plugins: PluginHandle

    private constructor(events: EventSystem, plugins: PluginHandle) {
        this.events = events
        this.plugins = plugins
    }

    public static async create(
        pluginPaths: string[],
        events: EventSystem = new EventSystem()
    ): Promise<Core> {
        const plugins = await loadPlugins(pluginPaths, events)

        return Promise.resolve(new this(events, plugins))
    }
}
