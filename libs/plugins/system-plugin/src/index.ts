import {PluginLoader} from "../../../core";
import {initProjectEndpoints} from "./modules/projects";

let core: PluginLoader;

export async function init(pluginLoader: PluginLoader) {
    core = pluginLoader

    await initProjectEndpoints(core)
}
