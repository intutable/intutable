import type { Column, Row, TableData } from "types"
import { static_implements } from "utils/static_implements"
import type { ColumnInfo, Condition } from "@intutable/lazy-views"
import type { ViewData as RawViewData } from "@intutable/lazy-views"
import type { ViewData } from "types"
import type { Filter } from "types/filter"
import * as FilterParser from "utils/DBParser/filter"
import { ColumnUtility } from "utils/ColumnUtility"
import { Parsable } from "@datagrid/Cells/abstract/Cell"
import cells from "@datagrid/Cells"

// Note: These types, describing data in a special state, should not be imported into the frontend's scope
// The namespace is exported only for module augmentation
export namespace DB {
    /**
     * This is how the data is saved in the sql based database.
     * Actually everything is saved as a string, even other primitives.
     *
     * It's the type of {@link ColumnInfo.attributes},
     * that was mistakenly implemented wihtout any type information.
     *
     * We use modul augmentation to add the type information
     * in `/types/module-augmenation/lazy-views.ts`.
     */
    export type Column = {
        _kind: string
        _cellContentType: string
        __columnIndex__: number | null
        userPrimary: 0 | 1
        displayName: string
        editable?: 1 | 0 | null
        width?: string | null
        minWidth?: string | null
        maxWidth?: string | null
        cellClass?: string | null
        headerCellClass?: string | null
        summaryCellClass?: string | null
        summaryFormatter?: string | null
        groupFormatter?: string | null
        colSpan?: string | null
        frozen?: 1 | 0 | null
        resizable?: 1 | 0 | null
        sortable?: 1 | 0 | null
        sortDescendingFirst?: 1 | 0 | null
        headerRenderer?: string | null
    }
    /**
     * `__rowIndex` is currently not saved in the db, although the backend
     * has its own row ordering mechanism. Will be changed in the future
     */
    export type _Row = Omit<Row, "__rowIndex__">
}

/** sort a column by its index */
export const byIndex = (a: ColumnInfo, b: ColumnInfo) =>
    a.attributes.__columnIndex__! > b.attributes.__columnIndex__! ? 1 : -1

// TODO: should these parse methods use the `parse` methods from the cells based on the type?
/** Creates a 'parse' and 'deparse' method with proper types for each property in `{ [KEY]: [DEPARSED, PARSED] }` */
type ParsableStatic<T extends { [index: string]: [unknown, unknown] }> = {
    [Key in keyof T as `parse${Capitalize<Key & string>}`]: (
        value: T[Key][0],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
    ) => T[Key][1]
} & {
    [Key in keyof T as `deparse${Capitalize<Key & string>}`]: (
        value: T[Key][1],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
    ) => T[Key][0]
}

/** Instance methods & static methods implements  */
type DBParserStaticImplements = {
    // new (): {} // <-- instance methods
} & ParsableStatic<{
    row: [DB._Row, Row]
    column: [ColumnInfo, Column.Serialized]
    filter: [Condition, Filter]
    table: [RawViewData, TableData]
    view: [RawViewData, ViewData.Serialized]
}>

/**
 * Values get saved weirdly in the database. This parses the values to the correct data structure.
 */
@static_implements<DBParserStaticImplements>()
export class DBParser {
    static parseRows(rows: DB._Row[], columns: ColumnInfo[]): Row[] {
        const indexColumn = columns.find(
            column => column.attributes._kind === "index"
        )
        if (indexColumn == null)
            throw new RangeError(
                `${DBParser.name}: Could not find any index column when parsing the view.`
            )

        const parsedRows = rows

        columns.forEach(column => {
            const { _cellContentType } = column.attributes
            const util = cells.getCell(_cellContentType)
            parsedRows.map(row =>
                DBParser.parseRow(
                    row,
                    row[indexColumn.key] as number,
                    column.key,
                    util.parse
                )
            )
        })

        return parsedRows as Row[]
    }

    static parseRow(
        row: DB._Row,
        rowIndex: number,
        key: string,
        parse: Parsable["parse"]
    ): Row {
        const parsedRow = row
        parsedRow[key] = parse(row[key])

        return {
            ...parsedRow,
            // TODO: Hack: __rowIndex__ is not saved in the database, the plugins keep the order of the rows. this should be removed in the future by saving the value and combining it with the index column
            __rowIndex__: rowIndex,
        } as Row
    }
    static deparseRow(
        row: Row,
        key: string,
        deparse: Parsable["stringify"]
    ): DB._Row {
        const { __rowIndex__, ...serializedRow } = row // delete the rowIndex
        const deparsed = serializedRow
        deparsed[key] = deparse(row[key])
        return deparsed as Row
    }

    static parseColumn(column: ColumnInfo): Column.Serialized {
        const { displayName, userPrimary, ...col } = column.attributes
        return {
            ...col,
            _id: column.id,
            name: displayName,
            key: column.key,
        } as Column.Serialized
    }
    static deparseColumn(
        column: Column.Serialized,
        info: Omit<ColumnInfo, "attributes">
    ): ColumnInfo {}

    static parseFilter(condition: Condition): Filter {
        return FilterParser.parse(condition)
    }
    static deparseFilter(filter: Filter): Condition {
        return FilterParser.deparse(filter)
    }

    static parseTable(view: RawViewData): TableData {
        // used to populate the  `__rowIndex__` property
        // TODO: in the future this will be reversed
        // instead the __rowIndex__ will populate the index column
        const indexColumn = view.columns.find(
            column => column.attributes._kind === "index"
        )

        if (indexColumn == null)
            throw new RangeError(
                `${DBParser.name}: Could not find any index column when parsing the view ${view.descriptor.id}.`
            )

        const parsedColumns = view.columns
            .sort(byIndex)
            .filter(col => ColumnUtility.isInternalColumn(col) === false)
            .map(DBParser.parseColumn)

        const parsedRows = DBParser.parseRows(view.rows, view.columns)

        return {
            metadata: {
                descriptor: view.descriptor,
                source: view.source,
                joins: view.joins,
                columns: view.columns,
            },
            columns: parsedColumns,
            rows: parsedRows,
        }
    }
    static deparseTable(tableData: TableData): RawViewData {}

    static parseView(view: RawViewData): ViewData.Serialized {
        // used to populate the  `__rowIndex__` property
        // TODO: in the future this will be reversed
        // instead the __rowIndex__ will populate the index column
        const indexColumn = view.columns.find(
            column => column.attributes._kind === "index"
        )

        if (indexColumn == null)
            throw new RangeError(
                `${DBParser.name}: Could not find any index column when parsing the view ${view.descriptor.id}.`
            )

        const parsedColumns = view.columns
            .sort(byIndex)
            .filter(col => ColumnUtility.isInternalColumn(col) === false)
            .map(DBParser.parseColumn)

        const parsedRows = DBParser.parseRows(view.rows, view.columns)

        return {
            descriptor: view.descriptor,
            metaColumns: view.columns,
            filters: view.rowOptions.conditions.map(DBParser.parseFilter),
            sortColumns: view.rowOptions.sortColumns,
            groupColumns: view.rowOptions.groupColumns,
            columns: parsedColumns,
            rows: parsedRows,
        }
    }
    static deparseView(view: ViewData.Serialized): RawViewData {}
}
