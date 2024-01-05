import { CoreRequest, CoreResponse, PluginLoader } from "@intutable-org/core"
import * as db from "@intutable-org/database/dist/requests"
import { addEndpoint, addMiddleware } from "@intutable-org/http"
import argon2 from "argon2"
import { Request, Response, NextFunction } from "express"
import session from "express-session"
import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import { User, AuthenticatedUser, Message } from "./types"
import { PLUGIN_NAME, CHANNEL } from "./internal"
import { getEnvironmentVariables } from "./environment"
import { homePage, loginPage, secretPage } from "./testPages"
import * as m from "./meta"
import * as req from "./requests"

const CURRENT_USER_KEY = "userAuthCurrentUser"

let plugin: PluginLoader

export async function init(_plugin: PluginLoader) {
    plugin = _plugin

    const { secret, dbUsername, dbPassword } = getEnvironmentVariables(true)
    try {
        // create a connection just to test the DB credentials
        const open = (await plugin.events.request(db.openConnection(dbUsername, dbPassword))) as {
            connectionId: string
        }
        await plugin.events.request(db.closeConnection(open.connectionId))
    } catch (e) {
        console.log(`${PLUGIN_NAME} could not connect to database`)
        plugin.events.notify({
            channel: CHANNEL,
            method: "cannotConnectToDatabase",
            cause: e,
        })
    }

    passport.use(new LocalStrategy(fetchUserAndValidatePassword))
    passport.serializeUser(serializeUser)
    passport.deserializeUser(deserializeUser)

    await addTestPages(plugin)
    await addLoginRoute(plugin)
    await addLogoutRoute(plugin)

    await addAuthMiddleware(plugin, secret)
    await restrictAllRoutes(plugin)

    await addCurrentUserMiddleware(plugin)

    plugin
        .listenForRequests("user-authentication")
        .on("hashPassword", hashPassword_)
        .on(req.getCurrentUser.name, getCurrentUser)
        .on(req.createUser.name, createUser_)
        .on(req.listUsers.name, listUsers_)
        .on(req.deleteUser.name, deleteUser_)
        .on(req.renameUser.name, renameUser_)
        .on(req.changeUserPassword.name, changeUserPassword_)
}

async function hashPassword_({ password }: CoreRequest): Promise<CoreResponse> {
    return hashPassword(password).then(hash => ({ hash }))
}
async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password)
}

/**
 * Yes, you saw correctly that the request method for this has no such
 * parameter.
 * The cheat is we institute an Express middleware that extracts the user from
 * the session and attaches it to the request, so it can be retrieved even
 * in the core.
 */
async function getCurrentUser({
    [CURRENT_USER_KEY]: currentUser,
}: CoreRequest): Promise<CoreResponse> {
    return {
        id: currentUser.id,
        username: currentUser.username,
    }
}

async function createUser_({
    connectionId,
    username,
    password,
}: CoreRequest): Promise<CoreResponse> {
    return createUser(connectionId, username, password)
}
async function createUser(connectionId: string, username: string, password: string): Promise<User> {
    const hash = await hashPassword(password)
    const idRow = await plugin.events.request(
        db.insert(connectionId, m.USERS, { [m.USERNAME]: username, [m.PASSWORD]: hash }, [m.ID])
    )
    return { id: idRow[m.ID], username }
}
async function listUsers_({ connectionId }: CoreRequest): Promise<CoreResponse> {
    return listUsers(connectionId)
}
async function listUsers(connectionId: string): Promise<User[]> {
    const rows = await plugin.events.request(db.select(connectionId, m.USERS))
    return rows.map((r: Record<string, any>) => ({
        id: r[m.ID],
        username: r[m.USERNAME],
    }))
}
async function deleteUser_({ connectionId, id }: CoreRequest): Promise<CoreResponse> {
    return deleteUser(connectionId, id)
}
async function deleteUser(connectionId: string, id: number): Promise<Message> {
    const deleted = await plugin.events.request(db.deleteRow(connectionId, m.USERS, [m.ID, id]))
    if (deleted.rowsDeleted !== 1)
        return Promise.reject({
            method: "deleteUser",
            error: `could not delete user #${id}`,
        })
    return { message: `deleted user #${id}` }
}
async function renameUser_({ connectionId, id, newName }: CoreRequest): Promise<CoreResponse> {
    return renameUser(connectionId, id, newName)
}
async function renameUser(connectionId: string, id: number, newName: string): Promise<Message> {
    const updated = await plugin.events.request(
        db.update(connectionId, m.USERS, {
            update: { [m.USERNAME]: newName },
            condition: [m.ID, id],
        })
    )
    if (updated.rowsUpdated !== 1)
        return Promise.reject({
            method: "renameUser",
            error: `could not rename user #${id}`,
        })
    return { message: `renamed user #${id} to ${newName}` }
}
async function changeUserPassword_({
    connectionId,
    id,
    newPassword,
}: CoreRequest): Promise<CoreResponse> {
    return changeUserPassword(connectionId, id, newPassword)
}
async function changeUserPassword(
    connectionId: string,
    id: number,
    newPassword: string
): Promise<Message> {
    const newHash = await hashPassword(newPassword)
    const updated = await plugin.events.request(
        db.update(connectionId, m.USERS, {
            update: { [m.PASSWORD]: newHash },
            condition: [m.ID, id],
        })
    )
    if (updated.rowsUpdated !== 1)
        return Promise.reject({
            method: "changeUserPassword",
            error: `could not change password for user #${id}`,
        })
    return { message: `renamed user #${id}'s password` }
}

const PUBLIC_ROUTES = ["/login"]

//TODO: replace this with JSON endpoints
async function addTestPages(plugin: PluginLoader) {
    plugin.events.request(addEndpoint("get", "/", homePage))
    plugin.events.request(addEndpoint("get", "/login", loginPage))
    plugin.events.request(addEndpoint("get", "/secret", secretPage))
}

async function addAuthMiddleware(plugin: PluginLoader, secret: string) {
    plugin.events.request(addMiddleware(session({ secret })))

    plugin.events.request(addMiddleware(passport.initialize()))
    plugin.events.request(addMiddleware(passport.session()))
}

async function addLoginRoute(plugin: PluginLoader) {
    plugin.events.request(
        addEndpoint(
            "post",
            "/login",
            passport.authenticate("local", {
                successRedirect: "/secret",
                failureRedirect: "/login",
            })
        )
    )
}

async function addLogoutRoute(plugin: PluginLoader) {
    plugin.events.request(
        addEndpoint("post", "/logout", (req: Request, res: Response) => {
            // FIXME: ???
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            req.logout()
            res.redirect("/")
        })
    )
}

async function restrictAllRoutes(plugin: PluginLoader) {
    await plugin.events.request(
        addMiddleware((req: Request, res: Response, next: NextFunction) => {
            if (isPublicRoute(req.path) || req.isAuthenticated()) {
                next()
            } else {
                res.redirect("/login")
            }
        })
    )
}

async function addCurrentUserMiddleware(plugin: PluginLoader) {
    await plugin.events.request(
        addMiddleware((req: Request, res: Response, next: NextFunction) => {
            if (req.isAuthenticated()) {
                const user = (<any>req.session).passport.user
                const currentUser: User = {
                    id: user.id,
                    username: user.username,
                }
                req.body[CURRENT_USER_KEY] = currentUser
            }
            next()
        })
    )
}

function isPublicRoute(route: string): boolean {
    return PUBLIC_ROUTES.includes(route)
}

async function fetchUser(username: string): Promise<AuthenticatedUser> {
    const { dbUsername, dbPassword } = getEnvironmentVariables(false)
    const open = (await plugin.events.request(db.openConnection(dbUsername, dbPassword)).catch(e =>
        Promise.reject({
            message: "user-authentication failed to connect to database",
            cause: e,
        })
    )) as { connectionId: string }
    const connectionId = open.connectionId
    try {
        const user = await plugin
            .request(
                db.select(connectionId, m.USERS, {
                    condition: [m.USERNAME, username],
                    columns: [m.ID, m.USERNAME, m.PASSWORD],
                })
            )
            .then(([user]: any) => user as AuthenticatedUser)
        return user
    } finally {
        await plugin.events.request(db.closeConnection(connectionId))
    }
}

export async function fetchUserAndValidatePassword(
    username: string,
    password: string,
    done: Function
) {
    const user = await fetchUser(username)

    if (!user || !(await isPasswordValid(password, user.password))) {
        return done(null, false)
    }

    return done(null, user)
}

async function isPasswordValid(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password)
}

export function serializeUser(user: any, done: Function) {
    done(null, { id: user[m.ID], username: user[m.USERNAME] })
}

export async function deserializeUser(user: any, done: Function) {
    return done(null, user)
}
