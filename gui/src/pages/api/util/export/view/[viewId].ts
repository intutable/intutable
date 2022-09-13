import {
    ViewData as RawViewData,
    ViewOptions,
    ColumnInfo,
    getViewData,
    getViewOptions,
    ViewDescriptor,
} from "@intutable/lazy-views"
import { coreRequest } from "api/utils"
import { View as ViewParser } from "api/utils/parse"
import { withCatchingAPIRoute } from "api/utils/withCatchingAPIRoute"
import { withUserCheck } from "api/utils/withUserCheck"
import { withSessionRoute } from "auth"
import fs from "fs-extra"
import { parseAsync } from "json2csv"
import path from "path"
import { Column, Row, ViewData } from "types"
import Obj from "types/Obj"
import { capitalizeFirstLetter } from "utils/capitalizeFirstLetter"
import { ColumnUtility } from "utils/ColumnUtility"
import { TmpDir } from "utils/TmpDir"

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
        /**
         * indices of rows to include in the export
         */
        rowSelection?: number[]
        csvOptions?: CSVExportOptions
    }
}

const intersectRows = (columns: Column.Serialized[], rows: Row[]) =>
    rows.map(row => {
        const intersection: Obj = {}

        columns.forEach(col => {
            const util = new ColumnUtility(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (col as any)["attributes"] as Column.Serialized
            ) // BUG: col is not Column.Serialized

            const value = row[col.key]
            const exported =
                value == null || value === "" ? "" : util.cell.export(value)
            const key = capitalizeFirstLetter(col.name)

            intersection[key] = exported
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

        // currently only csv is supported
        if (format !== "csv") throw new Error(`Unsupported format: ${format}`)

        const viewOptions = await coreRequest<ViewOptions>(
            getViewOptions(viewId),
            user.authCookie
        )
        const rawViewData = await coreRequest<RawViewData>(
            getViewData(viewId),
            user.authCookie
        )
        const viewData = ViewParser.parse(viewOptions, rawViewData)

        // only use the specified columns
        const cols: Column.Serialized[] = viewData.columns.filter(col =>
            columns.includes((col as unknown as Column & { id: number }).id)
        )

        let rows: ViewData.Serialized["rows"] = viewData.rows

        // only use the selected rows, if specified
        if (options?.rowSelection != null && options.rowSelection.length > 0) {
            // find the index column where the information about the indices are stored,
            // because the indices of each row are not accessible in the viewData
            // due to prefixes of the keys
            const indexColumn = viewData.columns.find(
                (c: Obj) => (c.attributes as Column.SQL)._kind === "index"
            )!
            // and remap to the actual rows
            rows = rows.map(row => ({
                ...row,
                __rowIndex__: row[indexColumn.key] as number,
            }))

            // filter out the rows that are not selected
            rows = rows.filter(row =>
                options.rowSelection!.includes(row.__rowIndex__)
            )
        }

        const data = intersectRows(cols, rows) // <-- this is where the magic happens
        const csv = await toCSV(data, options?.csvOptions)

        // create the file
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
