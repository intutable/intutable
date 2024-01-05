import { testPort } from "./testPort"

const PG_PORT = 5432
const RETRIES = 10

// TODO: do it properly, how postgresql suggests to do it
export async function waitForDatabase() {
    let connected = false
    let lastError: unknown
    let retries = RETRIES
    while (retries > 0 && !connected) {
        console.log(`waiting for database...`)
        console.log(`retries: ${retries}`)
        await testPort(PG_PORT)
            .then(() => {
                connected = true
            })
            .catch(e => {
                lastError = e
            })
        await new Promise(res => setTimeout(res, 3000))
        retries--
    }
    if (connected) {
        return
    } else {
        return Promise.reject({
            error: {
                message: "could not connect to database",
                reason: lastError,
            },
        })
    }
}
