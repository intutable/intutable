import Cell, { SerializedCell } from "../abstract/Cell"

export class TextSerialized extends SerializedCell {
    readonly brand = "string"
    label = "Text"
}

export class Text extends Cell {
    serializedCellDelegate = new TextSerialized()
}
