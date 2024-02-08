import { EventSystem, Message } from "."
import { Logger } from "./utils"

/** Notifications allow to broadcast messages to all subscribers. */
export interface CoreNotification extends Message {}
/**
 * Subscriber function to be registered either to a specific channel and method
 * or to all notifications.
 */
// TODO: rename to 'Listener' or 'Subscriber'
export type NotificationHandlerFunc = (notification: CoreNotification) => void

/**
 * Manages the broadcasting of notifications.
 * Allows to broadcast notifications and to subscribe to them.
 */
// TODO: rename to 'NotificationManager' as this name confuses with the actual notifcation handlers
export class NotificationHandler {
    /** `handlers[channel][method]` is an array of notification handlers registered for the given channel and method. */
    // TODO: use a map instead, this would make some methods below obsolete
    private handlers: Record<string, Record<string, NotificationHandlerFunc[]>>
    /** generic handlers are usual handlers, though not bound to a specific channel and method name. */
    private genericHandlers: NotificationHandlerFunc[]

    constructor(
        private events: EventSystem,
        private logger: Logger
    ) {
        this.handlers = {}
        this.genericHandlers = []
    }

    /**
     * Broadcasts a notification to all subscribers.
     *
     * @param notification to be broacasted.
     */
    // TODO: rename to 'broadcast' or similiar
    public handle(notification: CoreNotification) {
        this.logger.log("notification", notification)

        for (const subscriber of this.get(notification.channel, notification.method)) {
            subscriber(notification)
        }
    }

    /**
     * Adds a notification handler for a specific channel and method
     * aka subscribes to a notification.
     *
     * @param channel name to listen for notifications on.
     * @param method name within a channel to listen for notifications on.
     * @param handler function to be called when a notification is broadcasted.
     */
    // TODO: rename to 'subscribe' or similiar
    public add(channel: string, method: string, handler: NotificationHandlerFunc) {
        if (!this.handlers[channel]) {
            this.handlers[channel] = {}
        }

        if (!this.handlers[channel][method]) {
            this.handlers[channel][method] = []
        }

        this.handlers[channel][method].push(handler)

        this.logger.log("added notification listener for", channel)
    }

    /**
     * Subscribe to all notifications.
     *
     * @param handler will be called for all notifications.
     */
    public addGeneric(handler: NotificationHandlerFunc) {
        this.genericHandlers.push(handler)
        this.logger.log("added notification listener for all channels")
    }

    /**
     * Retrieves the notification handler functions for a given `channel` and `method`.
     *
     * @param channel name the handler is registered for.
     * @param method name inside the channel the handler is registered for.
     * @returns an array of notification handlers.
     */
    public get(channel: string, method: string): NotificationHandlerFunc[] {
        const handlers = this.getHandlers(channel, method).concat(this.genericHandlers)

        if (handlers.length === 0 && method !== "undefinded-notification-handler") {
            this.events.notify({
                channel: "core",
                method: "undefinded-notification-handler",
                message: `could not find any handler for ${channel}/${method}`
            })
        }

        return handlers
    }

    // private utility method for `get`
    private getHandlers(channel: string, method: string): NotificationHandlerFunc[] {
        if (this.hasNotificationHandler(channel, method)) {
            return this.handlers[channel][method]
        } else {
            return []
        }
    }

    // private utility method for `getHandlers
    private hasNotificationHandler(channel: string, method: string) {
        return this.handlers[channel] && this.handlers[channel][method]
    }
}
