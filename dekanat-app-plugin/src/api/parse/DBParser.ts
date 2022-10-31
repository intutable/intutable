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

import { Parsable } from "shared/dist/api/cells/abstract"
import { cells } from "shared/dist/api/cells"
import { Parser } from "../Parser"

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

/**
 * Values get saved weirdly in the database. This parses the values to the correct data structure.
 */
export class DBParser {
    static parseRows(rows: DB.Row[], columns: ColumnInfo[]): Row[] {
        const indexColumn = columns.find(
            column => column.attributes.kind === "index"
        )
        if (indexColumn == null)
            throw new RangeError(
                `${DBParser.name}: Could not find any index column when parsing the view.`
            )
        const parsedRows = rows

        columns.forEach(column => {
            const { cellType } = column.attributes
            const util = cells.getCell(cellType)
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
        row: DB.Row,
        rowIndex: number,
        key: string,
        parser: Parsable
    ): Row {
        const parsedRow = row
        parsedRow[key] = parser.parse(row[key])

        return {
            ...parsedRow,
            // TODO: Hack: __rowIndex__ is not saved in the database, the plugins keep the order of the rows. this should be removed in the future by saving the value and combining it with the index column
            index: rowIndex,
        } as Row
    }

    static parseColumnInfo(column: ColumnInfo): SerializedColumn {
        const { displayName, isUserPrimaryKey, isInternal, ...col } =
            column.attributes
        return {
            ...col,
            id: column.id,
            name: displayName,
            key: column.key,
            isUserPrimaryKey: numberToBoolean(isUserPrimaryKey),
            isInternal: numberToBoolean(isInternal),
        } as unknown as SerializedColumn
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
        const def = (a: unknown): boolean => a !== undefined && a !== null
        return {
            ...(def(column.kind) && { kind: column.kind }),
            ...(def(column.cellType) && {
                cellType: column.cellType,
            }),
            ...(def(column.index) && {
                index: column.index,
            }),
            ...(def(column.isUserPrimaryKey) && {
                isUserPrimaryKey: booleanToNumber(column.isUserPrimaryKey),
            }),
            ...(def(column.isInternal) && {
                isInternal: booleanToNumber(column.isInternal),
            }),
            ...(def(column.name) && { displayName: column.name }),
            ...(def(column.editable) && {
                editable: booleanToNumber(column.editable),
            }),
            ...(def(column.width) && {
                width: numberToString(column.width),
            }),
            ...(def(column.minWidth) && {
                minWidth: numberToString(column.minWidth),
            }),
            ...(def(column.maxWidth) && {
                maxWidth: numberToString(column.maxWidth),
            }),
            ...(def(column.cellClass) && { cellClass: column.cellClass }),
            ...(def(column.headerCellClass) && {
                headerCellClass: column.headerCellClass,
            }),
            ...(def(column.summaryCellClass) && {
                summaryCellClass: column.summaryCellClass,
            }),
            ...(def(column.summaryFormatter) && {
                summaryFormatter: column.summaryFormatter,
            }),
            ...(def(column.groupFormatter) && {
                groupFormatter: column.groupFormatter,
            }),
            ...(def(column.colSpan) && { colSpan: column.colSpan }),
            ...(def(column.frozen) && {
                frozen: booleanToNumber(column.frozen),
            }),
            ...(def(column.resizable) && {
                resizable: booleanToNumber(column.resizable),
            }),
            ...(def(column.sortable) && {
                sortable: booleanToNumber(column.sortable),
            }),
            ...(def(column.sortDescendingFirst) && {
                sortDescendingFirst: booleanToNumber(
                    column.sortDescendingFirst
                ),
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
        const parsedColumns = view.columns
            .filter(col => col.attributes.isInternal === 0)
            .map(DBParser.parseColumnInfo)
            .sort(Parser.sortByIndex)
        const parsedRows = DBParser.parseRows(view.rows, view.columns)

        return {
            metadata: { ...view },
            columns: parsedColumns,
            rows: parsedRows,
        }
    }

    static parseView(view: RawViewData): SerializedViewData {
        const parsedColumns = view.columns
            .filter(col => col.attributes.isInternal === 0)
            .map(DBParser.parseColumnInfo)
            .sort(Parser.sortByIndex)

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
