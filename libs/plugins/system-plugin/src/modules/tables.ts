import {PluginLoader, CoreResponse, CoreRequest} from "../../../../core";
import {CHANNEL} from "../config"
let core: PluginLoader;

export async function initTableEndpoints(pluginLoader: PluginLoader) {
    core = pluginLoader

    core
        .listenForRequests(CHANNEL)
        .on("getTables", getTables, "GET", "/tables/:projectid")
        .on("getTable", getTable, "GET", "/table/:id")
        .on("patchTable", patchTable, "PATCH", "/table/:id")
        .on("deleteTable", deleteTable, "DELETE", "/table/:id")
        .on("createTable", createTable, "POST", "/table")
}

async function getTables(): Promise<CoreResponse> {

}

async function getTable(request: CoreRequest): Promise<CoreResponse> {

}

async function patchTable(request: CoreRequest): Promise<CoreResponse> {

}

async function deleteTable(request: CoreRequest): Promise<CoreResponse> {

}

async function createTable(request: CoreRequest): Promise<CoreResponse> {

}