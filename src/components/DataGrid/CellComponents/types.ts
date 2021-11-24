/**
 * Types that can be used in a cell.
 * @default string
 * • `string` is stored as a string
 * • `number` is stored as a number
 * • `percentage` is stored as a number with a percentage symbol e.g. `12,34 %` (german format with comma as decimal separator)
 * • `currency` is stored as a number with a currency symbol e.g. `12,34 €` (german format with comma as decimal separator)
 * • `boolean` is stored as a boolean and represented as a checkbox
 * • `date` is stored as a string that represents a date with the date only e.g. `24.11.2021` (dd.mm.yyyy)
 * • `datetime` is stored as a date e.g. `24.11.2021 17:00` (dd.mm.yyyy hh:mm 24h format)
 * • `time` is stored as a string that represents a time without a date e.g. `17:00` (hh:mm 24h format)
 * • `avatar` is stored as a complex object containing an image
 * • `link` is stored as a string which represents a link
 * • `email` is stored as a string which represents an email address
 * • `select` is stored as an array of strings which represents a selectable list of options (only one option can be selected)
 * • `multiSelect` is stored as an array of strings which represents a selectable list of options (multiple options can be selected)
 * • `complex` is stored as a complex object
 */
export type CellType =
    | "string"
    | "number"
    | "percentage"
    | "currency"
    | "boolean"
    | "date"
    | "datetime"
    | "time"
    | "avatar"
    | "link"
    | "email"
    | "select"
    | "multiSelect"
    | "complex"

/**
 * Date format
 * @default dd.mm.yyyy
 */
export type DateFormat = "dd.mm.yyyy" | "dd/mm/yyyy"

/**
 * Time format
 * @default 24h
 */
export type TimeFormat = "12h" | "24h"

/**
 * Date time format
 * @default 'dd.mm.yyyy 24h'
 */
export type DateTimeFormat = {
    dateformat: DateFormat
    timeformat: TimeFormat
}

/**
 * Currency format
 * @default EURO
 */
export type CurrencyFormat = "EURO" | "DOLLAR" | "YEN" | "POUND" | "RUBLE" | "WON"

/**
 * Manages how a user can access a cell.
 * Tells nothing about the cell's visibility to other users.
 * @default editable
 */
export type CellAccessType = "readonly" | "editable"

/**
 * Position of the cell's content.
 * @default left
 */
export type CellContentPosition = "left" | "right" | "center"
