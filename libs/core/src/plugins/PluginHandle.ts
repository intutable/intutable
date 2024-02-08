import { Plugin } from "./Plugin"

/**
 * `PluginHandle` keeps (track of) all plugins.
 */
export class PluginHandle {
    private _plugins: Plugin[]

    constructor(plugins: Plugin[]) {
        this._plugins = plugins
    }

    /** Calls a `close` method in all plugins, if available. */
    public async closeAll() {
        for (const plugin of this._plugins) {
            if (plugin.module.close) {
                await plugin.module.close()
            }
        }
    }

    /** Returns all plugins. */
    public get plugins(): Plugin[] {
        return this._plugins
    }
}
