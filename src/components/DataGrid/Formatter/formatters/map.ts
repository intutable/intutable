import { MetaColumnProps } from "types"
import { Formatter } from "../formatters"
import { FormatterComponent } from ".."
import { LinkColumnFormatter } from "./LinkColumnFormatter"
import { StandardFormatter } from "./StandardFormatter"
import { LookupColumnFormatter } from "./LookupColumnFormatter"

/**
 * __Note__: `standard` is declared twice. Once in {@link Formatter} and once in {@link MetaColumnProps._kind}.
 * This can be ignored because `standard` in {@link MetaColumnProps._kind} means: ignore {@link MetaColumnProps._kind}
 * or `null` and instead only use {@link Formatter}. Also described in {@link MetaColumnProps._kind}.
 */
type formatters = Formatter | MetaColumnProps["_kind"]

export const FormatterComponentMap: {
    [key in formatters]: FormatterComponent
} = {
    standard: StandardFormatter,
    link: LinkColumnFormatter,
    lookup: LookupColumnFormatter,
}
