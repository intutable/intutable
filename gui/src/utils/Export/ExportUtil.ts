import {
    getViewData,
    getViewOptions,
    ViewData as RawViewData,
    ViewDescriptor,
    ViewOptions,
} from "@intutable/lazy-views"
import { coreRequest } from "api/utils"
import { View as ViewParser } from "api/utils/parse"
import fs from "fs-extra"
import { parseAsync } from "json2csv"
import { NextApiResponse } from "next"
import path from "path"
import { Column, Row, ViewData } from "types"
import Obj from "types/Obj"
import { User } from "types/User"
import { capitalizeFirstLetter } from "utils/capitalizeFirstLetter"
import { ColumnUtility } from "utils/ColumnUtility"
import { TmpDir } from "../TmpDir"
import { ExportRequest } from "./ExportRequest"

export class ExportUtil {
    private response: NextApiResponse
    private viewId: ViewDescriptor["id"]

    public exportedData: Obj[] | null = null

    constructor(
        private job: ExportRequest,
        {
            response,
            viewId,
        }: {
            response: NextApiResponse
            viewId: ViewDescriptor["id"]
        },
        private user: User
    ) {
        this.response = response
        this.viewId = viewId
    }

    public async export(): Promise<void> {
        const data = await this.fetchData()

        const selected = this.select(data)
        const intersected = this.intersect(selected.columns, selected.rows)

        this.exportedData = intersected

        return
    }

    public async send(): Promise<void> {
        if (this.exportedData == null) throw new Error("No data was exported")

        // export to specified format
        const exported = await this.toCSV()

        // create file
        const filename = this.makeFilename()
        const dir = new TmpDir()
        const file = path.join(dir.path, filename)
        await fs.writeFile(file, exported)
        const stat = await fs.stat(file)

        // write headers
        this.response.writeHead(200, {
            "Content-Type": `text/${this.job.file.format}`,
            "Content-Length": stat.size,
        })

        // stream file
        const readStream = fs.createReadStream(file)
        await new Promise(resolve => {
            readStream.pipe(this.response)
            readStream.on("end", resolve)
        })

        // cleanup
        dir.delete()
    }

    // utils

    private async fetchData(): Promise<ViewData.Serialized> {
        const viewOptions = await coreRequest<ViewOptions>(
            getViewOptions(this.viewId),
            this.user.authCookie
        )
        const rawViewData = await coreRequest<RawViewData>(
            getViewData(this.viewId),
            this.user.authCookie
        )
        const viewData = ViewParser.parse(viewOptions, rawViewData)

        return viewData
    }

    private select(data: ViewData.Serialized) {
        // only use the specified columns
        const columns: Column.Serialized[] = data.columns.filter(col =>
            this.job.options.columnSelection.includes(col._id)
        )

        let rows: ViewData.Serialized["rows"] = data.rows

        // only use the selected rows, if specified
        if (
            this.job.options.rowSelection != null &&
            this.job.options.rowSelection.length > 0
        ) {
            // find the index column where the information about the indices are stored,
            // because the indices of each row are not accessible in the viewData
            // due to prefixes of the keys
            const indexColumn = data.columns.find(c => c._kind === "index")!
            // and remap to the actual rows
            rows = rows.map(row => ({
                ...row,
                __rowIndex__: row[indexColumn.key] as number,
            }))

            // filter out the rows that are not selected
            rows = rows.filter(row =>
                this.job.options.rowSelection!.includes(row.__rowIndex__)
            )
        }

        return {
            columns: columns,
            rows: rows,
        }
    }

    private intersect(columns: Column.Serialized[], rows: Row[]) {
        return rows.map(row => {
            const intersection: Obj = {}

            columns.forEach(col => {
                const util = new ColumnUtility(col)

                const value = row[col.key]
                const exported =
                    value == null || value === "" ? "" : util.cell.export(value)
                const key = capitalizeFirstLetter(col.name)

                intersection[key] = exported
            })

            return intersection
        })
    }

    private async toCSV() {
        return await parseAsync(this.exportedData!, {
            header: this.job.options.includeHeader ?? false, // default 'false' if not specified
            includeEmptyRows: this.job.options.includeEmptyRows ?? false, // default 'false' if not specified // BUG: does not work somehow
            withBOM: true,
        })
    }

    // TODO: frontend just overrides the filename

    static makeFilename(
        file: ExportRequest["file"] & Pick<ExportRequest, "date">
    ): string {
        // default 'true' if not specified
        if (file.excludeDateString == null || file.excludeDateString === false)
            // TODO: make filename OS friendly, exclude some special characters
            return `${file.name} ${file.date.toLocaleString("de-DE")}.${
                file.format
            }`

        return `${file.name}.${file.format}`
    }

    public makeFilename(): string {
        return ExportUtil.makeFilename({
            ...this.job.file,
            date: this.job.date,
        })
    }
}
