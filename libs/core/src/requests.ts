import { EventSystem, Message } from "./events"
import { Logger } from "./utils"
import {Endpoint} from "./http/http"
import {Request, Response} from "express"
import {pluginLoader} from "./plugins/loadPlugins"


export interface CoreRequest extends Message {}
export type CoreResponse = any

export type RequestHandlerFunc = (request: CoreRequest) => Promise<CoreResponse>

const endpoints: Endpoint[] = []

export class RequestHandler {
    private handlers: Record<string, Record<string, RequestHandlerFunc>>

    constructor(private events: EventSystem, private logger: Logger) {
        this.handlers = {}
    }

    public add(channel: string, method: string, handler: RequestHandlerFunc, httpMethod: string = "", httpRoute:string = "") {
        if (!this.handlers[channel]) {
            this.handlers[channel] = {}
        }

        if (this.handlers[channel][method]) {
            this.events.notify({
                channel: "core",
                method: "handler-overwrite",
                message: `overwriting request handler for method ${method} in channel ${channel}`,
            })
        }

        this.handlers[channel][method] = handler

        if(httpMethod && httpRoute) {
            endpoints.push({
                httpMethod: httpMethod,
                route: httpRoute,
                handler: (req: Request, res: Response) => {
                    pluginLoader
                        .request({ ...req.body, ...req.params } as CoreRequest)
                        .then((resp: CoreResponse) => {
                            res.setHeader("Content-Type", "application/json")
                            res.send(resp)
                        })
                        .catch((rawErr: { constructor: { name: any; }; message: any; stack: any; }) => {
                            res.status(500).send({ error: rawErr.message })
                        })
                },
            })
        }

        this.logger.log("added request listener for", channel, method)
    }

    public get(channel: string, method: string): RequestHandlerFunc {
        if (!this.hasHandler(channel, method)) {
            throw new Error(`could not find request handler for ${channel}/${method}`)
        }
        return this.handlers[channel][method]
    }

    private hasHandler(channel: string, method: string): boolean {
        return !!this.handlers[channel] && !!this.handlers[channel][method]
    }

    public handle(request: CoreRequest): Promise<CoreResponse> {
        return this.get(request.channel, request.method)(request)
    }
}

export function getEndpoints(){
    return endpoints
}
