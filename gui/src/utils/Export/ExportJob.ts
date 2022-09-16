import { ViewDescriptor } from "@intutable/lazy-views"
import { fetcher } from "api"
import { ExportRequest } from "./ExportRequest"

export class ExportJob {
    constructor(
        readonly view: ViewDescriptor,
        public requestObject: ExportRequest
    ) {}

    public async request(): Promise<string> {
        const file = await fetcher<string>({
            url: `/api/util/export/view/${this.view.id}`,
            body: {
                exportRequest: this.requestObject,
            },
            method: "POST",
            headers: {
                "Content-Type": `text/${this.requestObject.file.format}`,
                Accept: `text/${this.requestObject.file.format}`,
            },
            isReadstream: true,
        })

        return file
    }
}
