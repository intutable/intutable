import React, { Component } from "react"
import { CallingConstraint } from "src/constraints/util/Constraint"
import { AppContext } from "../util/AppContext"
import { Do } from "../util/Do"
import { DoObjectNotation } from "../util/ObjectNotation"

export type Severity = "error" | "warning" | "info"
export type LogItem = {
    constraint: string
    title: string
    severity: Severity
    body: React.ReactNode
}

/**
 * Logs anything to the constraint log
 */
export class Log implements Do {
    public caller: CallingConstraint

    constructor(public title: string, public message: string, public severity: Severity = "info") {}

    toJSON(): DoObjectNotation {
        return {
            __type: "do",
            __ctor: this.constructor.name,
            caller: this.caller,
            __props: [this.title, this.message, this.severity],
        }
    }

    execute(props: AppContext.Dispatch) {
        const { log } = props
        log({
            constraint: this.caller.name,
            title: this.title,
            severity: this.severity,
            body: this.message,
        })
    }
}
