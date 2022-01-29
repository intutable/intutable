import { TableData } from "@app/api"

export {}

/**
 * Create a Proxy that covers operations on table data and use this proxy widley in the application.
 * This seems to be useful since the v4 the frontend does need to cover type safety.
 *
 * • implement private properties that indicate the type etc.
 */

// let table: TableData = {}
const table = {}
// eslint-disable-next-line no-undef
const test = new Proxy(table, {
    get: (target, property, receiver) => {
        return Reflect.get(target, property)
    },
    isExtensible: target => false,
    preventExtensions: target => {
        Object.preventExtensions(target)
        return true
    },
})
