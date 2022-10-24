import Cell from "../abstract/Cell"
import AbcIcon from "@mui/icons-material/Abc"

export class Text extends Cell {
    readonly brand = "string"
    label = "Text"
    icon = AbcIcon
}
