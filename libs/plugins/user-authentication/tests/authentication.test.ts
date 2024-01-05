import argon2 from "argon2"
import path from "path"
import { Core } from "@intutable/core"
import { getEnvironmentVariables } from "../src/environment"
import { User } from "../src/types"
import * as m from "../src/meta"
import * as db from "@intutable/database/dist/requests"
import * as req from "../src/requests"

let core: Core
let DB_CONN_ID = "user-auth-test"

// the two default users always present in the DB
const DEFAULT_SAM = "sam@foo.com"
const DEFAULT_NICK = "nick@bar.org"

beforeAll(async () => {
    const { dbUsername, dbPassword } = getEnvironmentVariables(false)
    core = await Core.create([
        path.join(__dirname, "../node_modules/@intutable/*"),
        path.join(__dirname, "../"),
    ])
    const open = (await core.events.request(
        db.openConnection(dbUsername, dbPassword)
    )) as { connectionId: string }
    DB_CONN_ID = open.connectionId
})

afterAll(async () => {
    await core.events.request(db.closeConnection(DB_CONN_ID))
    await core.plugins.closeAll()
})

describe("provides utility functions for password handling", () => {
    test("can hash a password", async () => {
        let password = "123"

        let { hash } = (await core.events.request(
            req.hashPassword(password)
        )) as any

        expect(await argon2.verify(hash, password)).toBe(true)
    })
})

describe("create/delete users", () => {
    const USERNAME = "newUser#1"
    const PASSWORD = "12345678"

    test("create a user", async () => {
        const user: User = await core.events.request(
            req.createUser(DB_CONN_ID, USERNAME, PASSWORD)
        )
        const rows = await core.events.request(db.select(DB_CONN_ID, m.USERS))
        await core.events.request(req.deleteUser(DB_CONN_ID, user.id))
        expect(rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [m.USERNAME]: USERNAME,
                }),
            ])
        )
        const userRow = rows.find(
            (r: Record<string, unknown>) => r[m.USERNAME] === USERNAME
        )
        // interesting, it looks like argon2 generates different hashes for
        // the same password, but can verify their connection somehow.
        expect(await argon2.verify(userRow[m.PASSWORD], PASSWORD)).toBe(true)
    })
    test("delete a user", async () => {
        const user: User = await core.events.request(
            req.createUser(DB_CONN_ID, USERNAME, PASSWORD)
        )
        await core.events.request(req.deleteUser(DB_CONN_ID, user.id))
        const rows = await core.events.request(db.select(DB_CONN_ID, m.USERS))
        expect(rows).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    [m.USERNAME]: USERNAME,
                }),
            ])
        )
    })
})

describe("view/edit users", () => {
    const USERNAME = "newUser#2"
    const PASSWORD = "12345679"
    let userId: number

    beforeAll(async () => {
        userId = await core.events
            .request(req.createUser(DB_CONN_ID, USERNAME, PASSWORD))
            .then((user: User) => user.id)
    })
    afterAll(async () => {
        await core.events.request(req.deleteUser(DB_CONN_ID, userId))
    })
    test("list users", async () => {
        const list: User[] = await core.events.request(
            req.listUsers(DB_CONN_ID)
        )
        expect(list).toEqual(
            expect.arrayContaining(
                [DEFAULT_SAM, DEFAULT_NICK, USERNAME].map(u =>
                    expect.objectContaining({ [m.USERNAME]: u })
                )
            )
        )
    })
    test("change users' usernames and passwords", async () => {
        const newName = "newerUser#3"
        const newPassword = "00000000"
        await core.events.request(req.renameUser(DB_CONN_ID, userId, newName))
        await core.events.request(
            req.changeUserPassword(DB_CONN_ID, userId, newPassword)
        )
        const rows = await core.events.request(db.select(DB_CONN_ID, m.USERS))
        expect(rows).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ [m.USERNAME]: newName }),
            ])
        )
        const userRow = rows.find(
            (r: Record<string, any>) => r[m.USERNAME] === newName
        )
        expect(await argon2.verify(userRow[m.PASSWORD], newPassword)).toBe(true)
    })
})
