import type { Condition } from "@intutable/lazy-views"
import { DB, SerializedColumn } from "shared/src/types"
import { Filter } from "../types/filter"
import { Cast, CastOperations } from "./Cast"
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
 * #### Casting
 *
 * Values that are represented in the database format need to be casted before being sent to the frontend,
 * since everthing is saved as a string.
 *
 */
export class Parser {
    private cast: CastOperations = new Cast()
    private restructure = new Restructure()

    constructor() {}

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
