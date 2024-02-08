import { EventSystem } from "./events"
import { loadPlugins, PluginHandle } from "./plugins"

export * from "./plugins"
export * from "./events"
export * from "./middleware"

/**
 * `core` is the plugin manager for the entire backend architecture.
 *
 * It is responsible for loading plugins, managing the lifecycle of plugins
 * as well as handling events, notifications, and other cross-plugin communication,
 * registering REST API endpoints etc.
 *
 * Usually, a backend service will keep one instance of `core` and it will automatically
 * load all plugins within a specified location.
 */
export class Core {
    /** Instance of `core`'s own event system. */
    events: EventSystem
    /** Handle instance to all plugins1. */
    plugins: PluginHandle

    /**
     * Default constructor.
     *
     * **Note:** If you do not want to load the plugins all by yourself,
     * use the `create` method instead.
     *
     * @param events event system instance to be used by `core`.
     * @param plugins already configured plugin handle instance to be used by `core`.
     */
    private constructor(events: EventSystem, plugins: PluginHandle) {
        this.events = events
        this.plugins = plugins
    }

    /**
     * Allows to initialize a `core` instance without manually creating an event system instance
     * as well as loading and configuring the plugins.
     * It will automatically load all plugins within a specified path and use a fresh event system instance.
     *
     * @param pluginPaths an array of glob paths to load plugins from, e.g. `["./plugins/*"]`.
     * @param events (optional) event system instance to be used by `core` (default: `new EventSystem()`).
     * @returns a promise resolving to a `core` instance.
     */
    public static async create(
        pluginPaths: string[],
        events: EventSystem = new EventSystem()
    ): Promise<Core> {
        const plugins = await loadPlugins(pluginPaths, events)

        return Promise.resolve(new this(events, plugins))
    }
}
