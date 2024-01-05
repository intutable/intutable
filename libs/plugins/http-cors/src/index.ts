import { PluginLoader } from "@intutable-org/core"
import { addMiddleware } from "@intutable-org/http/dist/requests"
import cors from "cors"

import { getAllowedOrigins } from "./config"

export async function init(plugins: PluginLoader) {
    const origins: string | string[] = await getAllowedOrigins()
    plugins.request(
        addMiddleware(
            cors({
                origin: origins,
                credentials: true,
            })
        )
    )
}
