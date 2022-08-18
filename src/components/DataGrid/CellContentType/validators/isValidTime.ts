import { isValid, parse } from "date-fns"

export const isValidTime = (value: unknown): boolean => isValid(value)

export const parseTime = parse
