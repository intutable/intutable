import { Column } from "types"
import { CellContentType } from "./types/CellContentType"
import { Editor } from "./types/Editor"
import { Formatter } from "./types/Formatter"

export const inferFormatterType = (
    component: Formatter
): Column.Serialized["formatter"] => "linkColumn" // TODO: infer somehow
