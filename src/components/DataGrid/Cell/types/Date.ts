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
