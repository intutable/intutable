import { JSONizable } from "./JSONizable"
import { OperatorObjectNotation } from "./ObjectNotation"

export type OperatorType = "or" | "and" | "xor"

export class Operator implements JSONizable<OperatorObjectNotation> {
    constructor(public readonly operator: OperatorType) {}

    static validate(operand1: boolean, operator: OperatorType, operand2: boolean): boolean {
        switch (operator) {
            case "or":
                return operand1 || operand2
            case "and":
                return operand1 && operand2
            case "xor":
                return !operand1 != !operand2
            default:
                throw new Error("Unknown operator: " + operator)
        }
    }

    // static evaluate(condition: )

    toJSON(): OperatorObjectNotation {
        return {
            __type: "operator",
            __ctor: this.constructor.name,
            operator: this.operator,
        }
    }
}
