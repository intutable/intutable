/**
 * This dummy plugin allows us to run initialization (config, example data)
 * on starting up the core.
 */
import { PluginLoader } from "@intutable/core";
export declare function init(plugins: PluginLoader): Promise<void>;
