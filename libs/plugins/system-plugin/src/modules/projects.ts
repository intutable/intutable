import {PluginLoader, CoreResponse, CoreRequest} from "../../../../core";
import {CHANNEL} from "../config"
let core: PluginLoader;

export async function initProjectEndpoints(pluginLoader: PluginLoader) {
    core = pluginLoader

    core
        .listenForRequests(CHANNEL)
        .on("getProjects", getProjects, "GET", "/projects")
        .on("getProject", getProject, "GET", "/project/:id")
        .on("patchProject", patchProject, "PATCH", "/project/:id")
        .on("deleteProject", deleteProject, "DELETE", "/project/:id")
        .on("createProject", createProject, "POST", "/project")
}

async function getProjects(): Promise<CoreResponse> {

}

async function getProject(request: CoreRequest): Promise<CoreResponse> {

}

async function patchProject(request: CoreRequest): Promise<CoreResponse> {

}

async function deleteProject(request: CoreRequest): Promise<CoreResponse> {

}

async function createProject(request: CoreRequest): Promise<CoreResponse> {

}