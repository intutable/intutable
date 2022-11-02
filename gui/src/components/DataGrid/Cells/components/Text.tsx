import Cell from "../abstract/Cell"
import { Text as TextSerialized } from "@shared/api/cells/components"

export class Text extends Cell {
    readonly brand = "string"
    label = "Text"
}
