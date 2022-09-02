/**
 * Copies the column to the clipboard.
 */
export const columnToClipboard = (values: (string | number | boolean)[]) => {
    navigator.clipboard.writeText(values.join(","))
}
