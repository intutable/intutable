import { ViewDescriptor } from "@intutable/lazy-views"
import { fetcher } from "api"
import { ExportRequest } from "./ExportRequest"
import * as fs from "fs-extra"

export type ExportResponse = {
    file: string
    filename: string
}

export class ExportJob {
    constructor(readonly view: ViewDescriptor, public request: ExportRequest) {}

    public async sendRequest(): Promise<ExportResponse> {
        const file = await fetcher<string>({
            url: `/api/util/export/view/${this.view.id}`,
            body: {
                ...this.request,
            },
            method: "POST",
            headers: {
                "Content-Type": `text/${this.request.file.format}`,
                Accept: `text/${this.request.file.format}`,
            },
            isReadstream: true,
        })

        const filename = await fs.readFile(file, { encoding: "utf-8" })
        console.log("filename?:", filename)
        return {
            file,
            filename: "filename",
        }
    }
}
