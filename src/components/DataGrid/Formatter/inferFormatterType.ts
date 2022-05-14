import { Column } from "types"
import { CellContentType } from "../Editor_Formatter/types/CellContentType"
import { EditorComponent } from "../Editor_Formatter/types/EditorComponent"
import { FormatterComponent } from "./types/FormatterComponent"

export const inferFormatterType = (
    component: FormatterComponent
): Column.Serialized["formatter"] => "standard" // TODO: infer somehow
