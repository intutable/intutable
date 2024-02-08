import { MiddlewareHandler, MiddlewareResponseType } from "./middleware"
import { CoreNotification, NotificationHandler } from "./notifications"
import { CoreRequest, CoreResponse, RequestHandler } from "./requests"
import { Logger } from "./utils"

export type { CoreRequest, CoreResponse, CoreNotification }

/**
 * A message is the basic unit of communication within the `EventSystem`
 * with a `channel` and a `method` as its main properties in order to uniquely
 * identify a recipient of this message.
 *
 * Optionally, a message can and likely will contain additional properties
 * specified through index signatures.
 */
export interface Message {
    /**
     * Each plugin can register methods. A channel functions as a namespace here.
     * The channel should be unique per plugin and one plugin usually uses one channel.
     * It is a good practice to use the plugin name as channel name.
     */
    channel: string
    /**
     * Name of the registered method within the `channel`.
     */
    method: string
    // Additional properties the recipient expects.
    [index: string]: any
}

/**
 * The `EventSystem` is `core`'s system to manage various communication and event handling tasks.
 *
 * It is primarily responsible for inter-plugin communication.
 * Despite this, it keeps instances for middleware, logging, notifications etc. and re-exports user-facing interfaces.
 */
export class EventSystem {
    private logger: Logger
    private requests: RequestHandler
    private notifications: NotificationHandler
    private middleware: MiddlewareHandler

    public listenForRequests: RequestHandler["add"]
    public listenForNotifications: NotificationHandler["add"]
    public listenForAllNotifications: NotificationHandler["addGeneric"]
    public notify: NotificationHandler["handle"]

    /** Add middleware. */
    public addMiddleware: MiddlewareHandler["add"]

    constructor(debugging = false) {
        this.logger = new Logger(debugging)
        this.requests = new RequestHandler(this, this.logger)
        this.notifications = new NotificationHandler(this, this.logger)
        this.middleware = new MiddlewareHandler(this, this.logger)

        // delegate to handlers
        this.listenForNotifications = this.notifications.add.bind(this.notifications)
        this.listenForAllNotifications = this.notifications.addGeneric.bind(this.notifications)
        this.notify = this.notifications.handle.bind(this.notifications)

        this.listenForRequests = this.requests.add.bind(this.requests)

        this.addMiddleware = this.middleware.add.bind(this.middleware)
    }

    /**
     * Inter-plugin communication.
     * Send a request to a method registered within a specific plugin
     * and receive a response.
     *
     * @param request a core request object that contains
     * @returns a promise that resolves to the response of the recipient or a middleware.
     */
    public async request(request: CoreRequest): Promise<CoreResponse> {
        this.logger.log("request", request)
        const { type, payload } = await this.middleware.handle(request)

        // see middleware.ts for how this works
        if (type === MiddlewareResponseType.Resolve) {
            return Promise.resolve(payload)
        } else if (type === MiddlewareResponseType.Reject) {
            return Promise.reject(payload)
        } else {
            return this.requests.handle(payload)
        }
    }
}
