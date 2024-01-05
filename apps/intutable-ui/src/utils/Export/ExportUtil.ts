import { ViewDescriptor } from "@intutable-org/lazy-views"
import { coreRequest } from "api/utils"
import { getViewData } from "../../../../../libs/dekanat-app-plugin/dist/requests"

import fs from "fs-extra"
import { parseAsync } from "json2csv"
import { NextApiResponse } from "next"
import path from "path"
import { Column, Row, ViewData } from "types"
import { withReadOnlyConnection } from "api/utils/databaseConnection"
import Obj from "types/Obj"
import { User } from "types/User"
import { capitalizeFirstLetter } from "utils/capitalizeFirstLetter"
import { TmpDir } from "../TmpDir"
import { ExportRequest } from "./ExportRequest"
import { Cell } from "@datagrid/Cells/abstract/Cell"
import { cellMap } from "@datagrid/Cells"

/**
 * Helps to export the data of views.
 *
 * This class can be used in the backend.
 */
export class ExportUtil {
    private response: NextApiResponse // response of the api handler
    private viewId: ViewDescriptor["id"]

    public exportedData: Obj[] | null = null // cache the selected and intersected data that should be exported in the next step

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

    /**
     * Queries the data and prepares it for export into a specific format.
     */
    public async export(): Promise<void> {
        const data = await this.fetchData()

        const selected = this.select(data)
        const intersected = this.intersect(selected.columns, selected.rows)

        this.exportedData = intersected

        return
    }

    /**
     * Creates the file and writes the data into it.
     * Then sends the file to the client.
     */
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

    /** Get the view data */
    private async fetchData(): Promise<ViewData.Serialized> {
        return withReadOnlyConnection(this.user, async sessionID =>
            coreRequest<ViewData.Serialized>(
                getViewData(sessionID, this.viewId),
                this.user.authCookie
            )
        )
    }

    /** Only use columns selected by the user for export as well as rows, if marked */
    private select(data: ViewData.Serialized) {
        // only use the specified columns
        const columns: Column.Serialized[] = data.columns.filter(col =>
            this.job.options.columnSelection.includes(col.id)
        )

        let rows: ViewData.Serialized["rows"] = data.rows

        // only use the selected rows, if specified
        if (this.job.options.rowSelection != null && this.job.options.rowSelection.length > 0) {
            // find the index column where the information about the indices are stored,
            // because the indices of each row are not accessible in the viewData
            // due to prefixes of the keys
            const indexColumn = data.columns.find(c => c.kind === "index")!
            // and remap to the actual rows
            rows = rows.map(row => ({
                ...row,
                index: row[indexColumn.key] as number,
            }))

            // filter out the rows that are not selected
            rows = rows.filter(row => this.job.options.rowSelection!.includes(row.index))
        }

        return {
            columns: columns,
            rows: rows,
        }
    }

    /** This creates an intersection from the column and row objects
     * – prepares the data that is stores in several different columns and rows  */
    private intersect(columns: Column.Serialized[], rows: Row[]) {
        return rows.map(row => {
            const intersection: Obj = {}

            columns.forEach(col => {
                const ctor = cellMap.getCellCtor(col.cellType)

                const value = row[col.key]
                const exported = value == null || value === "" ? "" : ctor.export(value)
                const key = capitalizeFirstLetter(col.name)

                intersection[key] = exported
            })

            return intersection
        })
    }

    /** Export the intersected data to CSV */
    private async toCSV() {
        if (this.exportedData == null) throw new Error("No data was exported")

        const _excludeEmptyRows = (data: typeof this.exportedData): typeof this.exportedData =>
            data.filter(row => ExportUtil.isEmptyRow(row) === false)

        // `includeEmptyRows` does not work
        // it probably depends on what `empty` means
        const data =
            this.job.options.includeEmptyRows ?? false
                ? this.exportedData
                : _excludeEmptyRows(this.exportedData)

        return await parseAsync(data, {
            header: this.job.options.includeHeader ?? false, // default 'false' if not specified
            // includeEmptyRows: this.job.options.includeEmptyRows ?? false, // default 'false' if not specified // BUG: does not work somehow
            withBOM: true,
        })
    }

    static isEmptyRow(row: Row | Obj<unknown>): boolean {
        return Object.values(row).every(Cell.isEmpty)
    }

    // TODO: frontend just overrides the filename
    static makeFilename(file: ExportRequest["file"] & Pick<ExportRequest, "date">): string {
        // default 'true' if not specified
        if (file.excludeDateString == null || file.excludeDateString === false)
            // TODO: make filename OS friendly, exclude some special characters
            return `${file.name} ${file.date.toLocaleString("de-DE")}.${file.format}`

        return `${file.name}.${file.format}`
    }

    public makeFilename(): string {
        return ExportUtil.makeFilename({
            ...this.job.file,
            date: this.job.date,
        })
    }
}
