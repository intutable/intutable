import {PluginLoader} from "../../../core";
import {initProjectEndpoints} from "./modules/projects";
import {initTableEndpoints} from "./modules/tables";
import {initViewEndpoints} from "./modules/views";
import {initAuthEndpoints} from "./modules/auth";

let core: PluginLoader;

export async function init(pluginLoader: PluginLoader) {
    core = pluginLoader

    await initProjectEndpoints(core)
    await initTableEndpoints(core)
    await initViewEndpoints(core)
    await initAuthEndpoints(core)
}
