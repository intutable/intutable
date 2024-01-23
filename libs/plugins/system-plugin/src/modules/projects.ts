import {PluginLoader, CoreResponse, CoreRequest} from "../../../../core";
import {ProjectDescriptor} from "../../../project-management/src/types"
import * as pm from "../../../project-management/dist/requests"
import {can, getRoles} from "../../../user-permissions/src/requests"
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

async function getProjects(request: CoreRequest): Promise<CoreResponse> {
    const allProjects = (await core.events.request(
        pm.getProjects(request.connectionId, 0)
    )) as ProjectDescriptor[]

    const roleId = await core.events.request(getRoles(request.connectionId, "", request.username))
    const permissions = await core.events.request(
        can(request.connectionId, roleId[0], "read", "project", "", "")
    )
    const checkedProjects: ProjectDescriptor[] = []

    if (permissions["isAllowed"] && permissions["conditions"] == "") {
        return allProjects
    }

    for (const project of allProjects) {
        if (permissions["conditions"].includes(project["name"])) {
            checkedProjects.push(project)
        }
    }

    return checkedProjects
}

async function getProject(request: CoreRequest): Promise<CoreResponse> {

}

async function patchProject(request: CoreRequest): Promise<CoreResponse> {

}

async function deleteProject(request: CoreRequest): Promise<CoreResponse> {

}

async function createProject(request: CoreRequest): Promise<CoreResponse> {

}