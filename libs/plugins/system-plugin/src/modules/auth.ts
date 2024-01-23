import {PluginLoader, CoreResponse, CoreRequest} from "../../../../core";
import {CHANNEL} from "../config"
let core: PluginLoader;

export async function initAuthEndpoints(pluginLoader: PluginLoader) {
    core = pluginLoader

    core
        .listenForRequests(CHANNEL)
        .on("login", login, "POST", "/login")
        .on("logout", logout, "POST", "/logout")
        .on("user", user, "GET", "/user")

    async function login(request: CoreRequest): Promise<CoreResponse> {

    }

    async function logout(request: CoreRequest): Promise<CoreResponse> {

    }

    async function user(request: CoreRequest): Promise<CoreResponse> {

    }
}