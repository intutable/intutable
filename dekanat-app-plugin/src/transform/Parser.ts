import type { Condition } from "@intutable/lazy-views/dist/types"
import { asTable } from "@intutable/lazy-views/dist/selectable"
import type { RawViewColumnInfo, RawViewData } from "../types/raw"
import { DB, SerializedColumn, SerializedViewData, TableData } from "shared/dist/types"
import { Filter } from "../types/filter"
import { cast } from "./cast"
import { internalColumnUtil } from "./InternalColumnUtil"
import * as FilterParser from "./filter"
import { restructure } from "./restructure"

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

export class ParserClass {
    private castColumn(column: DB.Restructured.Column): SerializedColumn {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            isInternal, // omit
            ...serializedProps
        } = column

        const casted: SerializedColumn = {
            ...serializedProps,
            isUserPrimaryKey: cast.toBoolean(column.isUserPrimaryKey),
            hidden: cast.toBoolean(column.hidden),
            width: cast.orEmpty(cast.or.bind(cast.toNumber.bind(cast), cast.toString.bind(cast)), column.width),
            minWidth: cast.orEmpty(cast.toNumber.bind(cast), column.minWidth),
            maxWidth: cast.orEmpty(cast.toNumber.bind(cast), column.maxWidth),
            editable: cast.orEmpty(cast.toBoolean.bind(cast), column.editable),
            frozen: cast.orEmpty(cast.toBoolean.bind(cast), column.frozen),
            resizable: cast.orEmpty(cast.toBoolean.bind(cast), column.resizable),
            sortable: cast.orEmpty(cast.toBoolean.bind(cast), column.sortable),
            sortDescendingFirst: cast.orEmpty(cast.toBoolean.bind(cast), column.sortDescendingFirst),
        }
        return casted
    }

    public parseColumn(column: RawViewColumnInfo): SerializedColumn {
        const restructured = restructure.column(column)
        return this.castColumn(restructured)
    }
    public deparseColumn(column: Partial<SerializedColumn>): Partial<DB.Column> {
        /* This method included restructuring and casting */
        const keys = Object.keys(column) as (keyof SerializedColumn)[]
        const dbcolumn: Partial<DB.Column> = {}
        keys.forEach(key => {
            const value = column[key] as unknown
            switch (key) {
                // restructure name
                case "name":
                    dbcolumn["displayName"] = value as string
                    break
                case "hidden":
                case "isUserPrimaryKey":
                    dbcolumn[key] = cast.toDatabaseBoolean(value)
                    break
                case "index":
                    dbcolumn[key] = cast.toNumber(value)
                    break

                // optionally null keys
                case "kind":
                case "cellType":
                case "cellClass":
                case "headerCellClass":
                case "summaryCellClass":
                case "summaryFormatter":
                case "groupFormatter":
                case "colSpan":
                    dbcolumn[key] = value as string
                    break

                case "width":
                case "minWidth":
                case "maxWidth":
                    dbcolumn[key] = cast.orEmpty(cast.toString.bind(cast), value)
                    break
                case "editable":
                case "frozen":
                case "resizable":
                case "sortable":
                case "sortDescendingFirst":
                    dbcolumn[key] = cast.orEmpty(cast.toDatabaseBoolean.bind(cast), value)
                    break

                // ignore keys of SerializedColumn that are not in DB.Column
                default:
                    console.error("ignored:", key, value)
                    break
            }
        })
        return dbcolumn
    }

    public parseTable(view: RawViewData): TableData {
        const restructuredColumns = view.columns.map(restructure.column)
        const { columns: internalProcessedColumns, rows: internalProcessRows } =
            internalColumnUtil.processInternalColumns({
                columns: restructuredColumns,
                rows: view.rows,
            })
        const castedColumns = internalProcessedColumns.map(this.castColumn)

        return {
            descriptor: view.descriptor,
            joins: view.joins,
            rawTable: asTable(view.source).table,
            rawColumns: view.columns,
            columns: castedColumns.sort(ParserClass.sortByIndex),
            rows: internalProcessRows,
        }
    }
    public parseView(view: RawViewData): SerializedViewData {
        const restructuredColumns = view.columns.map(restructure.column)
        const { columns: internalProcessedColumns, rows: internalProcessRows } =
            internalColumnUtil.processInternalColumns({
                columns: restructuredColumns,
                rows: view.rows,
            })
        const castedColumns = internalProcessedColumns.map(this.castColumn)
        return {
            descriptor: view.descriptor,
            metaColumns: view.columns,
            filters: view.rowOptions.conditions.map(ParserClass.parseFilter),
            sortColumns: view.rowOptions.sortColumns,
            groupColumns: view.rowOptions.groupColumns,
            columns: castedColumns.sort(ParserClass.sortByIndex),
            rows: internalProcessRows,
        }
    }

    static parseFilter(condition: Condition): Filter {
        return FilterParser.parse(condition)
    }
    static deparseFilter(filter: Filter): Condition {
        return FilterParser.deparse(filter)
    }

    /** sort algorithm for columns based on its index */
    static sortByIndex<T extends DB.Restructured.Column | SerializedColumn>(a: T, b: T) {
        return a.index > b.index ? 1 : -1
    }
}

export const parser = new ParserClass()
