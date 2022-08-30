/** Default row options for a new table view. */
import { ParentColumnDescriptor, RowOptions } from "@intutable/lazy-views/dist/types";
import { CellContentType } from "./types";
export declare const UID_KEY = "_id";
export declare const INDEX_KEY = "index";
/** Minimum width of a column. */
export declare const COLUMN_MIN_WIDTH = 128;
/**
 * Blank row options - no filters, no grouping, no sorting.
 */
export declare function emptyRowOptions(): RowOptions;
/**
 * Default row options: obviously no filtering or grouping. Only order by
 * index, to keep rows from jumping around when you edit them.
 */
export declare function defaultRowOptions(
/**
 * The interface {@link ParentColumnDescriptor} can take columns of
 * a table or a view. */
columns: ParentColumnDescriptor[]): RowOptions;
export declare function defaultViewName(): string;
export declare function standardColumnAttributes(displayName: string, contentType: CellContentType, columnIndex?: number, userPrimary?: boolean): any;
export declare function linkColumnAttributes(displayName: string, columnIndex?: number): any;
export declare function lookupColumnAttributes(displayName: string, contentType: CellContentType, columnIndex?: number): any;
export declare function indexColumnAttributes(columnIndex?: number): any;
