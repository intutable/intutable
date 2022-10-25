import { isValidEMailAddress } from "../../../utils/isValidEMailAddress"
import { Cell } from "../abstract"

export class EMail extends Cell {
    readonly brand = "email"
    label = "E-Mail"
    isValid(value: unknown): boolean {
        return value == null || value === "" || isValidEMailAddress(value)
    }
}
