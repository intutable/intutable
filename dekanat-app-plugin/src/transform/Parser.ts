import type {
    ColumnInfo,
    Condition,
    ViewData as RawViewData,
} from "@intutable/lazy-views"
import {
    DB,
    SerializedColumn,
    SerializedViewData,
    TableData,
} from "shared/src/types"
import { Filter } from "../types/filter"
import { Cast } from "./cast"
import { InternalColumnUtil } from "./InternalColumnUtil"
import * as FilterParser from "./filter"
import { Restructure } from "./restructure"

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
    private cast = new Cast()

    private castColumn(column: DB.Restructured.Column): SerializedColumn {
        const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            isInternal, // omit
            ...serializedProps
        } = column

        const casted: SerializedColumn = {
            ...serializedProps,
            isUserPrimaryKey: this.cast.toBoolean(column.isUserPrimaryKey),
            width: this.cast.orEmpty(
                this.cast.or.bind(this.cast.toNumber, this.cast.toString),
                column.width
            ),
            minWidth: this.cast.orEmpty(this.cast.toNumber, column.minWidth),
            maxWidth: this.cast.orEmpty(this.cast.toNumber, column.maxWidth),
            editable: this.cast.orEmpty(this.cast.toBoolean, column.editable),
            frozen: this.cast.orEmpty(this.cast.toBoolean, column.frozen),
            resizable: this.cast.orEmpty(this.cast.toBoolean, column.resizable),
            sortable: this.cast.orEmpty(this.cast.toBoolean, column.sortable),
            sortDescendingFirst: this.cast.orEmpty(
                this.cast.toBoolean,
                column.sortDescendingFirst
            ),
        }
        return casted
    }

    public parseColumn(column: ColumnInfo): SerializedColumn {
        const restructured = this.restructure.column(column)
        return this.castColumn(restructured)
    }
    public deparseColumn(
        column: Partial<SerializedColumn>
    ): Partial<DB.Column> {
        /* This method included restructuring and casting */
        const keys = Object.keys(column) as (keyof SerializedColumn)[]
        const dbcolumn: Partial<DB.Column> = {}
        keys.forEach(key => {
            const value = column[key] as unknown
            switch (key) {
                case "id":
                    throw new Error("Not allowed to change id")
                case "index":
                    throw new Error("Property 'index' is an internal column")
                case "name":
                    dbcolumn["displayName"] = value as string
                    break
                case "key":
                    throw new Error("not allowed to change key") // TODO: or am I?
                case "width":
                    dbcolumn[key] = this.cast.orEmpty(this.cast.toString, value)
                    break
                case "minWidth":
                    dbcolumn[key] = this.cast.orEmpty(this.cast.toString, value)
                    break
                case "maxWidth":
                    dbcolumn[key] = this.cast.orEmpty(this.cast.toString, value)
                    break
                case "editable":
                    dbcolumn[key] = dbcolumn[key] = this.cast.orEmpty(
                        this.cast.toDatabaseBoolean,
                        value
                    )
                    break
                case "frozen":
                    dbcolumn[key] = dbcolumn[key] = this.cast.orEmpty(
                        this.cast.toDatabaseBoolean,
                        value
                    )
                    break
                case "resizable":
                    dbcolumn[key] = dbcolumn[key] = this.cast.orEmpty(
                        this.cast.toDatabaseBoolean,
                        value
                    )
                    break
                case "sortable":
                    dbcolumn[key] = dbcolumn[key] = this.cast.orEmpty(
                        this.cast.toDatabaseBoolean,
                        value
                    )
                    break
                case "sortDescendingFirst":
                    dbcolumn[key] = this.cast.orEmpty(
                        this.cast.toDatabaseBoolean,
                        value
                    )
                    break
                case "isUserPrimaryKey":
                    dbcolumn[key] = this.cast.toDatabaseBoolean(value)
                    break
                default:
                    dbcolumn[key] = value as string
                    break
            }
        })
        return dbcolumn
    }

    public parseTable(view: RawViewData): TableData {
        const restructuredColumns = view.columns.map(this.restructure.column)
        const { columns: internalProcessedColumns, rows: internalProcessRows } =
            this.internalColumnUtil.processInternalColumns({
                columns: restructuredColumns,
                rows: view.rows,
            })
        const castedColumns = internalProcessedColumns.map(this.castColumn)

        return {
            metadata: { ...view },
            columns: castedColumns.sort(Parser.sortByIndex),
            rows: internalProcessRows,
        }
    }
    public parseView(view: RawViewData): SerializedViewData {
        const restructuredColumns = view.columns.map(this.restructure.column)
        const { columns: internalProcessedColumns, rows: internalProcessRows } =
            this.internalColumnUtil.processInternalColumns({
                columns: restructuredColumns,
                rows: view.rows,
            })
        const castedColumns = internalProcessedColumns.map(this.castColumn)
        return {
            descriptor: view.descriptor,
            metaColumns: view.columns,
            filters: view.rowOptions.conditions.map(Parser.parseFilter),
            sortColumns: view.rowOptions.sortColumns,
            groupColumns: view.rowOptions.groupColumns,
            columns: castedColumns.sort(Parser.sortByIndex),
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
    static sortByIndex<T extends DB.Restructured.Column | SerializedColumn>(
        a: T,
        b: T
    ) {
        return a.index > b.index ? 1 : -1
    }
}
