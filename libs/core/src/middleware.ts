import { CoreRequest, EventSystem } from "./events"
import { Logger } from "./utils"

/**
 * The response type of a middleware specifies how its request should be processed and what data should be returned.
 */
export enum MiddlewareResponseType {
    /**
     * The request will be passed to the next middleware or to its destination request handler.
     *
     * If the middleware has a payload in its response attaches, this payload will be passed as the request
     * instead of the request object itself.
     */
    Pass,
    /**
     * The middleware intercepts the request and the request will not be passed to the next middleware
     * nor to its destination request handler.
     *
     * Instead the middleware's payload will be returned as the response of the request in a resolved promise.
     * This allows to intercept and modify the request.
     */
    Resolve,
    /**
     * The middleware rejects the request and the request will not be passed to the next middleware
     * nor to its destination request handler.
     *
     * Instead the middleware's payload will be returned as the response of the request in a rejected promise.
     * This allows to intercept and modify the request.
     */
    Reject
}

/**
 * Each middleware resolves to a response that indicates its status
 * and may contain a payload that is attached to the request.
 */
export interface MiddlewareResponse {
    type: MiddlewareResponseType
    /** Custom payload of the middleware OR the passed request. */
    payload: any
}
/**
 * Middleware allows to intercept requests and notifications and modify or just observe them.
 * In this respect, middlewares are wrappers around the event system.
 */
export type Middleware = (request: CoreRequest) => Promise<MiddlewareResponse>

/**
 * Handles middleware registration and execution.
 */
// TODO: rename to 'MiddlewareManager' or similiar
export class MiddlewareHandler {
    private middlewares: Middleware[]

    constructor(
        private events: EventSystem,
        private logger: Logger
    ) {
        this.middlewares = []
    }

    /** Returns all midllewares. */
    public get(): Middleware[] {
        return this.middlewares
    }

    /** Add middleware to be run. */
    public add(middleWare: Middleware) {
        this.middlewares.push(middleWare)
        this.logger.log("middleware added")
    }

    /**
     * Handles the registered middlewares for a given request.
     *
     * The middlewares are applied to the request in the order in which they were registered.
     *
     * #### Scenario 1 – Intercepting the request and returning a custom response
     * If one middleware returns a response with a type of `MiddlewareResponseType.Resolve` or `MiddlewareResponseType.Reject`,
     * this response including the payload will be returned in a promise with the same type (resolve or reject).
     * Other middlewares after the current one will NOT be executed.
     *
     * #### Scenario 2 – forwarding the request
     * If the middleware returns a response with type `MiddlewareResponseType.Pass`, the request will be passed to the next middleware.
     * Moreover, if the middleware has a payload in its response, this payload will be passed as the request instead of the request object itself
     * to the next middleware.
     *
     * @param request that is passed through the middleware chain
     * @returns
     */
    public async handle(request: CoreRequest): Promise<MiddlewareResponse> {
        for (const middleware of this.middlewares) {
            const response = await middleware(request)

            // if it's not pass it is either resolved or rejected
            if (response.type !== MiddlewareResponseType.Pass) {
                return response
            }

            // if the middleware changed the request
            if (response.payload) {
                request = response.payload
            }
        }

        return { type: MiddlewareResponseType.Pass, payload: request }
    }
}
