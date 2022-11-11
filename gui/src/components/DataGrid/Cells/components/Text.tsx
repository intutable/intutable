import AbcIcon from "@mui/icons-material/Abc"
import { Cell } from "../abstract/Cell"

export class Text extends Cell {
    readonly brand = "string"
    label = "Text"
    icon = AbcIcon
}
