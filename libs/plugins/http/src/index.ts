import express, {
    Express,
    Request,
    Response,
    RequestHandler,
    json,
    urlencoded,
    request,
} from "express"
import { PluginLoader, CoreRequest, CoreResponse } from "@intutable-org/core"

export * from "./requests"

let app: Express
let server: any

const PORT = 8080

interface Endpoint {
    httpMethod: string
    route: string
    handler: RequestHandler
}

let plugins: PluginLoader

let endpoints: Endpoint[]
let middlewares: RequestHandler[]

function initializeApp() {
    app = express()

    for (const middleware of middlewares) {
        app.use(middleware)
    }

    for (const { httpMethod, route, handler } of endpoints) {
        // @ts-ignore
        app[httpMethod](route, handler)
    }
}

function initializeServer() {
    initializeApp()

    if (server) {
        server.close()
    }

    server = app.listen(PORT, () => {
        plugins.notify({
            channel: "http",
            method: "init",
            message: `listening for requests on port ${PORT}`,
        })
    })
}

export async function init(_plugins: PluginLoader) {
    plugins = _plugins

    endpoints = [
        {
            httpMethod: "post",
            route: "/request/:channel/:method",
            handler: (req: Request, res: Response) => {
                plugins
                    .request({ ...req.body, ...req.params } as CoreRequest)
                    .then((resp: CoreResponse) => {
                        res.setHeader("Content-Type", "application/json")
                        res.send(resp)
                    })
                    .catch(rawErr => {
                        const err =
                            rawErr instanceof Error
                                ? {
                                      type: rawErr.constructor.name,
                                      message: rawErr.message,
                                      stack: rawErr.stack,
                                      channel: req.params.channel,
                                      method: req.params.method,
                                  }
                                : rawErr
                        res.status(500).send({ error: err })
                    })
            },
        },
        {
            httpMethod: "post",
            route: "/notification/:channel/:method",
            handler: (req: Request, res: Response) => {
                plugins.notify({ ...req.body, ...req.params } as CoreRequest)
                res.end()
            },
        },
    ]

    middlewares = [
        json({ limit: "50mb" }),
        urlencoded({ extended: true, limit: "50mb", parameterLimit: 50000 }),
    ]

    initializeServer()

    plugins
        .listenForRequests("http")
        .on("addEndpoint", async ({ httpMethod, route, handler, ...request }: CoreRequest) => {
            endpoints.push({ httpMethod, route, handler })
            initializeServer()

            return {}
        })
        .on("addMiddleware", async ({ handler }: CoreRequest) => {
            middlewares.push(handler)
            initializeServer()
        })
}

export async function close() {
    await server.close()
}
