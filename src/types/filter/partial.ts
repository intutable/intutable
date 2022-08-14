import * as c from "@intutable/lazy-views/dist/condition"
import { SimpleFilter, MkFilter } from "./complete"


/**
 * An incomplete filter that exists during editing in the GUI.
 */
export type PartialFilter = MkFilter<PartialSimpleFilter>

/**
 * An incomplete, infix (e.g. <column>=10, <column> contains "substring", ...)
 * filter that exists during editing in the GUI.
 */
export type PartialSimpleFilter = Omit<SimpleFilter, "left" | "right"> &
    Partial<Pick<SimpleFilter, "left" | "right">>
