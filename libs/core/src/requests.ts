import { EventSystem, Message } from "./events"
import { Logger } from "./utils"

/**
 * A request is a message that expects a response from its recipient.
 * The requested method likely expects additional properties.
 */
export interface CoreRequest extends Message {}
/**
 * Abstract type for a response to a request.
 * The response can be anything the recipient wants to send back.
 */
export type CoreResponse = any

/**
 * A request handler is a function that takes a `CoreRequest` and returns a `CoreResponse`.
 * In this respect, it is the recipient and responder of a request.
 *
 * The handler is responsible for validating the request and returning a response.
 */
export type RequestHandlerFunc = (request: CoreRequest) => Promise<CoreResponse>

/**
 * The `RequestHandler` is responsible for managing multiple request handlers.
 * One can register a request handler for a specific channel and method and
 * the plugin system then can send requests to the handler and receive a response.
 */
export class RequestHandler {
    // data structure: handlers[channel][method]
    private handlers: Record<string, Record<string, RequestHandlerFunc>>

    constructor(
        private events: EventSystem,
        private logger: Logger
    ) {
        this.handlers = {}
    }

    /**
     * Register a request handler for a specific channel and method to which the handler should respond.
     *
     * @param channel the channel the method is registered in (usually the plugin name).
     * @param method the name of the method it is registered as (usually the actual method name).
     * @param handler the method / request handler.
     */
    public add(channel: string, method: string, handler: RequestHandlerFunc) {
        if (!this.handlers[channel]) {
            this.handlers[channel] = {}
        }

        if (this.handlers[channel][method]) {
            this.events.notify({
                channel: "core",
                method: "handler-overwrite",
                message: `overwriting request handler for method ${method} in channel ${channel}`
            })
        }

        this.handlers[channel][method] = handler

        this.logger.log("added request listener for", channel, method)
    }

    /**
     * Get the request handler for a specific channel and method.
     *
     * @param channel the channel the method is registered in (usually the plugin name).
     * @param method the name of the method it is registered as (usually the actual method name).
     * @returns the request handler.
     */
    public get(channel: string, method: string): RequestHandlerFunc {
        if (!this.hasHandler(channel, method)) {
            throw new Error(`could not find request handler for ${channel}/${method}`)
        }
        return this.handlers[channel][method]
    }

    /** Checks if a handler is registered within a `channel` under a `method`. */
    private hasHandler(channel: string, method: string): boolean {
        return !!this.handlers[channel] && !!this.handlers[channel][method]
    }

    /**
     * Calls the request handler for a specific channel and method with the request object.
     *
     * @param request The arguments for the request handler.
     * @returns The response from the request handler.
     */
    public handle(request: CoreRequest): Promise<CoreResponse> {
        return this.get(request.channel, request.method)(request)
    }
}
