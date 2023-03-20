import React from "react"
import { InfoBody } from "./Info"
import { SerializedLogEntry, LogEntry } from "./Log"

/** protocol */
export type LoggableComponentFactory<CP> = (props: {
    componentProps: CP
    logEntryProps: Omit<LogEntry, "body">
}) => SerializedLogEntry

export const deserialize = (logEntry: SerializedLogEntry): LogEntry => {
    const { __ctor, __props, ...loggable } = logEntry
    const component = Object.entries(ComponentMap).find(([name]) => name === __ctor)
    if (!component) throw new Error("No constructor found for: " + __ctor)

    const ctor = component[1]
    return {
        ...loggable,
        body: React.createElement(ctor, ...__props),
    }
}

export const ComponentMap: { [ctor: string]: React.FC<any> } = {
    [InfoBody.name]: InfoBody,
}
