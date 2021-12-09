import { Currency } from "./Currency"
import { Percentage } from "./Percentage"
import { Avatar } from "./Avatar"

/**
 * Types that can be used in a cell.
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
type _CellTypeMap = {
    string: string
    number: number
    percentage: Percentage
    currency: Currency
    boolean: boolean
    date: Date
    datetime: Date
    time: Date
    avatar: Avatar
    link: string
    email: string
    select: string[]
    multiSelect: string[]
    complex: Record<string, unknown>
}

// Note: keep this up to date with the types in `_CellTypeMap`
export const _RuntimeCellTypeMap = [
    "string",
    "number",
    "percentage",
    "currency",
    "boolean",
    "date",
    "datetime",
    "time",
    "avatar",
    "link",
    "email",
    "select",
    "multiSelect",
    "complex",
] as const

/**
 * Types that can be used in a cell.
 */
export type CellType = keyof _CellTypeMap

/**
 * Checks if a value if of cell type.
 * @param value The value to check
 * @returns
 */
export const isCellType = (value: any): value is CellType =>
    _RuntimeCellTypeMap.includes(value)

/**
 * Specifies the type of a CellType; e.g. (`string` -> string) or ("currency" -> Currency Class)
 */
export type CellData<T extends string> = T extends keyof _CellTypeMap
    ? _CellTypeMap[T]
    : never

/**
 * Manages how a user can access a cell.
 * Tells nothing about the cell's visibility to other users.
 * @default editable
 */
export type CellAccess = "readonly" | "editable"

/**
 * Position of the cell's content.
 * @default left
 */
export type CellContentPosition = "left" | "right" | "center"
