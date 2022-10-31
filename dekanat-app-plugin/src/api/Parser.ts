import type { Condition } from "@intutable/lazy-views"
import { Filter } from "../types/filter"
import { Cast, CastOperations } from "./cast"
import * as FilterParser from "./parse/filter"

/**
 * ### Parser
 *
 * The `Parser` combines multiple operations on multiple data structures.
 *
 * #### Restrcuturing
 *
 * Some data structures need to be restructured when they come out ot the database.
 * This includes renaming properties and merging objects into a single one.
 *
 * #### Casting
 *
 * Values that are represented in the database format need to be casted before being sent to the frontend,
 * since everthing is saved as a string.
 *
 */
export class Parser {
    private cast: CastOperations = new Cast()

    constructor() {}

    private processInternalColumns() {}

    public parseColumnInfo() {}
    public deparseColumn() {}
    public parseView() {}
    public parseTable() {}

    static parseFilter(condition: Condition): Filter {
        return FilterParser.parse(condition)
    }
    static deparseFilter(filter: Filter): Condition {
        return FilterParser.deparse(filter)
    }
}

/**
 * what's used:
 * • parse ColumnInfo
 * • deparse (partial) Column
 * • parse Table
 * • parse View
 * • parse & deparse Filter
 */
