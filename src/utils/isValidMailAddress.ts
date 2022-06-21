const MailAddressRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

/**
 * Determine if a string is a valid email address.
 */
export const isValidMailAddress = (value: unknown): boolean => {
    if (typeof value !== "string") return false

    return MailAddressRegex.test(value.toLowerCase())
}
