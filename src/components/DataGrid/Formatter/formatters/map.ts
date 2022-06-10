import { CellContentType } from "@datagrid/Editor/type-management"
import { MetaColumnProps } from "types"
import { FormatterComponent } from ".."
import { Formatter } from "../formatters"
import { EMailFormatter } from "./EMailFormatter"
import { LinkColumnFormatter } from "./LinkColumnFormatter"
import { StandardFormatter } from "./StandardFormatter"

export const FormatterComponentMap: {
    [key in MetaColumnProps["_kind"] | CellContentType]: FormatterComponent
} = {
    /** derived from {@link Column.Serialized._kind} */
    standard: StandardFormatter,
    link: LinkColumnFormatter,
    lookup: StandardFormatter,
    /** derived from {@link Column.Serialized.formatter} */
    string: StandardFormatter,
    number: StandardFormatter,
    percentage: StandardFormatter,
    currency: StandardFormatter,
    boolean: StandardFormatter,
    date: StandardFormatter,
    datetime: StandardFormatter,
    time: StandardFormatter,
    avatar: StandardFormatter,
    // link: StandardFormatter, // TODO: rename the types from MetaColumnProps["_kind"]
    email: EMailFormatter,
    select: StandardFormatter,
    multiSelect: StandardFormatter,
    complex: StandardFormatter,
}
