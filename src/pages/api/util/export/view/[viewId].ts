import { ColumnInfo, getViewData, ViewDescriptor } from "@intutable/lazy-views"
import { coreRequest } from "api/utils"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import fs from "fs-extra"
import { parseAsync } from "json2csv"
import path from "path"
import tmp from "tmp"
import { Column, Row, ViewData } from "types"
import Obj from "types/Obj"
import { isValidMailAddress } from "utils/isValidMailAddress"

const capitalizeFirstLetter = (string: string) =>
    string.charAt(0).toUpperCase() + string.slice(1)

export class TmpDir {
    public readonly path: string
    private removeCallback: () => void
    constructor() {
        const dir = tmp.dirSync({ unsafeCleanup: true })
        this.path = dir.name
        this.removeCallback = dir.removeCallback
    }
    delete() {
        this.removeCallback()
    }
}

export type AnyArray = (string | number | boolean)[]

export type CSVExportOptions = {
    /**
     * @default false
     */
    header?: boolean
    includeEmptyRows?: boolean
}

export type ExportViewRequestBody = {
    fileName: string
    format: "csv" | "json" | "xlsx" | "xml"
    columns: ColumnInfo["id"][]
    options?: {
        csvOptions?: CSVExportOptions
    }
}

const intersectRows = (columns: Column.Serialized[], rows: Row.Serialized[]) =>
    rows.map(row => {
        const intersection: Obj = {}

        columns.forEach(col => {
            const value = row[col.key]
            const key = capitalizeFirstLetter(col.name)

            // hack for email type: filter out every invalid address
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cellType = (col as any).attributes.editor
            if (cellType === "email") {
                if (isValidMailAddress(value) === false) {
                    intersection[key] = ""
                    return
                }
            }

            intersection[key] = value
        })

        return intersection
    })

export const toCSV = async (data: Obj[], csvOptions?: CSVExportOptions) =>
    await parseAsync(data, {
        header: csvOptions?.header === true,
        includeEmptyRows: csvOptions?.includeEmptyRows === true,
        withBOM: true,
    })

/**
 * Generate a Mail-List
 * @tutorial
 * ```
 * URL: `/util/generate/mail-list`
 * ```
 */
const POST = withCatchingAPIRoute(
    async (req, res, viewId: ViewDescriptor["id"]) => {
        const user = req.session.user!
        const { fileName, format, columns, options } = JSON.parse(
            req.body
        ) as ExportViewRequestBody

        if (format !== "csv") throw new Error(`Unsupported format: ${format}`)

        const viewData = await coreRequest<ViewData.Serialized>(
            getViewData(viewId),
            user.authCookie
        )

        const cols: Column.Serialized[] = viewData.columns.filter(col =>
            columns.includes((col as unknown as Column & { id: number }).id)
        )

        const data = intersectRows(cols, viewData.rows)
        const csv = await toCSV(data, options?.csvOptions)

        const filename = fileName + ".csv"
        const dir = new TmpDir()
        const csvFile = path.join(dir.path, filename)
        await fs.writeFile(csvFile, csv)
        const stat = await fs.stat(csvFile)

        res.writeHead(200, {
            "Content-Type": "text/csv",
            "Content-Length": stat.size,
        })

        const readStream = fs.createReadStream(csvFile)
        await new Promise(resolve => {
            readStream.pipe(res)
            readStream.on("end", resolve)
        })
        dir.delete()
    }
)

export default withSessionRoute(
    withUserCheck(async (req, res) => {
        const { query, method } = req
        const viewId = parseInt(query.viewId as string)

        switch (method) {
            case "POST":
                await POST(req, res, viewId)
                break
            default:
                res.setHeader("Allow", ["POST"])
                res.status(405).end(`Method ${method} Not Allowed`)
        }
    })
)
