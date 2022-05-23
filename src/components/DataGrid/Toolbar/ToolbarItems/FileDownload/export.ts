export type FileFormat = "PDF" | "CSV" | "XLSX" | "JSON"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const exportTo = async (format: FileFormat, data: unknown) =>
    Promise.resolve()
