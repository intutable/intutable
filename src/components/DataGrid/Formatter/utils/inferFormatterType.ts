import { Column } from "types"
import { FormatterComponent } from "../types/FormatterComponent"

export const inferFormatterType = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    component: FormatterComponent
): Column.Serialized["formatter"] => "standard" // TODO: infer somehow
