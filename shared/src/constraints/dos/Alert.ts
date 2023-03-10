import { Do } from "../util/Do"
import { DoObjectNotation } from "../util/ObjectNotation"

export type AlertType = {
    title: string
    severity: "error" | "warn" | "info"
    message: string
}

export class Alert implements Do {
    constructor(public alert: AlertType) {}

    toJSON(): DoObjectNotation {
        return {
            __type: "do",
            __ctor: this.constructor.name,
            alert: this.alert,
        }
    }

    execute() {}
}
