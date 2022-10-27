import type { ColumnInfo, Condition } from "@intutable/lazy-views"
import type { ViewData as RawViewData } from "@intutable/lazy-views"
import type {
    TableData,
    SerializedViewData,
    Row,
    SerializedColumn,
    DB,
} from "../../types/tables"
import { Filter } from "../../types/filter"
import * as FilterParser from "./filter"
import { isInternalColumn } from "shared/dist/api"
import { Parsable } from "shared/dist/api/cells/abstract"
import { cells } from "shared/dist/api/cells"

function booleanToNumber(value: boolean): 1 | 0
function booleanToNumber(
    value: boolean | undefined | null
): 1 | 0 | undefined | null
function booleanToNumber(value: boolean | undefined | null) {
    return typeof value === "boolean" ? (value ? 1 : 0) : value
}
function numberToBoolean(value: 1 | 0): boolean
function numberToBoolean(
    value: 1 | 0 | undefined | null
): boolean | undefined | null
function numberToBoolean(value: 1 | 0 | undefined | null) {
    return value === 1 ? true : value === 0 ? false : value
}
const numberToString = (value: string | number | undefined | null) =>
    typeof value === "number" ? value.toString() : value

/** sort a column by its index */
export const byIndex = (a: ColumnInfo, b: ColumnInfo) =>
    a.attributes.__columnIndex__! > b.attributes.__columnIndex__! ? 1 : -1

/**
 * Values get saved weirdly in the database. This parses the values to the correct data structure.
 */
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
                    util
                )
            )
        })

        return parsedRows as Row[]
    }

    static parseRow(
        row: DB._Row,
        rowIndex: number,
        key: string,
        parser: Parsable
    ): Row {
        const parsedRow = row
        parsedRow[key] = parser.parse(row[key])

        return {
            ...parsedRow,
            // TODO: Hack: __rowIndex__ is not saved in the database, the plugins keep the order of the rows. this should be removed in the future by saving the value and combining it with the index column
            __rowIndex__: rowIndex,
        } as Row
    }

    static parseColumnInfo(column: ColumnInfo): SerializedColumn {
        const { displayName, userPrimary, ...col } = column.attributes
        return {
            ...col,
            _id: column.id,
            name: displayName,
            key: column.key,
            userPrimary: numberToBoolean(userPrimary),
        } as SerializedColumn
    }

    static deparseColumn: (column: SerializedColumn) => DB.Column =
        DBParser.partialDeparseColumn

    /**
     * Ugly, but we need this partial version so that e.g. you can specify
     * incremental updates to columns, without pasting `undefined` over
     * every meta prop that you didn't pass along.
     */
    static partialDeparseColumn(column: SerializedColumn): DB.Column
    static partialDeparseColumn(
        column: Partial<SerializedColumn>
    ): Partial<DB.Column>
    static partialDeparseColumn(
        column: Partial<SerializedColumn>
    ): Partial<DB.Column> {
        return {
            ...(column._kind && { _kind: column._kind }),
            ...(column._cellContentType && {
                _cellContentType: column._cellContentType,
            }),
            ...(column.__columnIndex__ && {
                __columnIndex__: column.__columnIndex__,
            }),
            ...(column.userPrimary && {
                userPrimary: booleanToNumber(column.userPrimary),
            }),
            ...(column.name && { displayName: column.name }),
            ...(column.editable && {
                editable: booleanToNumber(column.editable),
            }),
            ...(column.width && { width: numberToString(column.width) }),
            ...(column.minWidth && {
                minWidth: numberToString(column.minWidth),
            }),
            ...(column.maxWidth && {
                maxWidth: numberToString(column.maxWidth),
            }),
            ...(column.cellClass && { cellClass: column.cellClass }),
            ...(column.headerCellClass && {
                headerCellClass: column.headerCellClass,
            }),
            ...(column.summaryCellClass && {
                summaryCellClass: column.summaryCellClass,
            }),
            ...(column.summaryFormatter && {
                summaryFormatter: column.summaryFormatter,
            }),
            ...(column.groupFormatter && {
                groupFormatter: column.groupFormatter,
            }),
            ...(column.colSpan && { colSpan: column.colSpan }),
            ...(column.frozen && { frozen: booleanToNumber(column.frozen) }),
            ...(column.resizable && {
                resizable: booleanToNumber(column.resizable),
            }),
            ...(column.sortable && {
                sortable: booleanToNumber(column.sortable),
            }),
            ...(column.sortDescendingFirst && {
                sortDescendingFirst: booleanToNumber(
                    column.sortDescendingFirst
                ),
            }),
            ...(column.headerRenderer && {
                headerRenderer: column.headerRenderer,
            }),
        }
    }
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
            .filter(col => isInternalColumn(col) === false)
            .map(DBParser.parseColumnInfo)
        const parsedRows = DBParser.parseRows(view.rows, view.columns)

        return {
            metadata: { ...view },
            columns: parsedColumns,
            rows: parsedRows,
        }
    }

    static parseView(view: RawViewData): SerializedViewData {
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
            .filter(col => isInternalColumn(col) === false)
            .map(DBParser.parseColumnInfo)

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
}
