import { Formatter } from "../types/Formatter"
import { FormatterComponent } from "../types/FormatterComponent"
import { DefaultFormatter } from "./DefaultFormatter"

export const FormatterComponentMap: {
    [key in Formatter]: FormatterComponent
} = {
    standard: DefaultFormatter,
}
