import React, { Component } from "react"
import { AppContext } from "../../util/AppContext"
import { Do } from "../../util/Do"
import { DoObjectNotation } from "../../util/ObjectNotation"

export type Severity = "error" | "warning" | "info"
export type LogEntry = {
    constraint: string
    title: string
    severity: Severity
    body: React.FC<unknown>
}

export type SerializedLogEntry = Omit<LogEntry, "body"> & {
    __ctor: string
    __props: unknown[]
}

/**
 * Logs anything to the constraint log
 */
export class Log implements Do {
    constructor(public component: SerializedLogEntry) {}

    toJSON(): DoObjectNotation {
        return {
            __type: "do",
            __ctor: this.constructor.name,
            __props: {
                component: this.component,
            },
        }
    }

    execute(props: AppContext.Dispatch) {
        const { addLogEntry } = props
        addLogEntry(this.component)
    }
}
