import { Formatter } from "../types/Formatter"
import {
    FormatterComponent,
    ExtandableFormatterComponent,
} from "../types/FormatterComponent"
import { DefaultFormatter } from "./DefaultFormatter"

export const FormatterComponentMap: {
    [key in Formatter]: FormatterComponent | ExtandableFormatterComponent
} = {
    standard: DefaultFormatter,
}
