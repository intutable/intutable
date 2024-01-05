import { RequestHandler } from "express"

const CHANNEL = "http"

type HttpMethod = "post" | "get" | "put" | "delete"

export function addEndpoint(httpMethod: HttpMethod, route: string, handler: RequestHandler) {
    return {
        channel: CHANNEL,
        method: "addEndpoint",
        httpMethod,
        route,
        handler,
    }
}

export function addMiddleware(handler: RequestHandler) {
    return {
        channel: "http",
        method: "addMiddleware",
        handler,
    }
}
