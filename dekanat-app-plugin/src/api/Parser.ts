import type { Condition } from "@intutable/lazy-views"
import { DB, SerializedColumn } from "shared/src/types"
import { Filter } from "../types/filter"
import { Cast, CastOperations } from "./Cast"
import { InternalColumnUtil } from "./InternalColumnUtil"
import * as FilterParser from "./parse/filter"
import { Restructure } from "./Restructure"

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
 * #### Internal Column Processing
 *
 * Internal columns are columns that should not be shipped to the frontend
 * but their data should be accessible in the row (just without a corresponding column, e.g. an index or id).
 *
 * #### Casting
 *
 * Values that are represented in the database format need to be casted before being sent to the frontend,
 * since everthing is saved as a string.
 *
 */
export class Parser {
    private restructure = new Restructure()
    private internalColumnUtil = new InternalColumnUtil()
    private cast: CastOperations = new Cast()

    constructor() {}

    public parseColumnInfo() {}
    public deparseColumn(column: Partial<SerializedColumn>) {}
    public parseView() {}
    public parseTable() {}

    static parseFilter(condition: Condition): Filter {
        return FilterParser.parse(condition)
    }
    static deparseFilter(filter: Filter): Condition {
        return FilterParser.deparse(filter)
    }

    /** sort algorithm for columns based on its index */
    static sortByIndex<T extends DB.Restructured.Column | SerializedColumn>(
        a: T,
        b: T
    ) {
        return a.index > b.index ? 1 : -1
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
