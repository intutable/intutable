import { isJSON, isJSONArray, isJSONObject } from "utils/isJSON"
import Cell from "../abstract/Cell"

export class Text extends Cell {
    readonly brand = "string"
    label = "Text"

    isValid(value: unknown) {
        return (
            (isJSONObject(value) === false &&
                isJSONArray(value) == false &&
                typeof value === "string") ||
            typeof value === "number" ||
            value == null
        )
    }
}
