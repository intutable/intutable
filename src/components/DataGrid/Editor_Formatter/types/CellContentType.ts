import {
    Currency,
    Percentage,
    Avatar,
} from "@datagrid/Editor_Formatter/type-management/utility-classes"

/**
 * Different types of editors.
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
type CellContentTypeMap = {
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

export const Runtime_CellContentType = [
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
export type CellContentType = keyof CellContentTypeMap

/**
 * Tells if a ReadonlyArray includes the element
 * (which can not be a superset in normal includes method).
 */
const includes = <T extends U, U>(
    coll: ReadonlyArray<T>,
    value: U
): value is T => coll.includes(value as T)

/**
 * Checks if a value is a editor type.
 * @param value The value to check
 * @returns
 */
export const isCellContentType = (value: unknown): value is CellContentType => {
    if (typeof value !== "string") return false
    return includes(Runtime_CellContentType, value)
}

/**
 * Specifies the type of input for a editor; e.g. (`string` -> string) or ("currency" -> Currency Class)
 */
export type CellInputData<T extends CellContentType> =
    T extends keyof CellContentTypeMap ? CellContentTypeMap[T] : never
