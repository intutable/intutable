import {PluginLoader, CoreResponse, CoreRequest} from "../../../../core";
import {CHANNEL} from "../config"
let core: PluginLoader;

export async function initViewEndpoints(pluginLoader: PluginLoader) {
    core = pluginLoader

    core
        .listenForRequests(CHANNEL)
        .on("getViews", getViews, "GET", "/views/:projectid")
        .on("getView", getView, "GET", "/view/:id")
        .on("patchView", patchView, "PATCH", "/view/:id")
        .on("deleteView", deleteView, "DELETE", "/view/:id")
        .on("createView", createView, "POST", "/view")
}

async function getViews(): Promise<CoreResponse> {

}

async function getView(request: CoreRequest): Promise<CoreResponse> {

}

async function patchView(request: CoreRequest): Promise<CoreResponse> {

}

async function deleteView(request: CoreRequest): Promise<CoreResponse> {

}

async function createView(request: CoreRequest): Promise<CoreResponse> {

}