import { Core } from "@intutable-org/core"
import { join as joinPath } from "path"

async function main() {
    await Core.create([
        joinPath(__dirname, "../node_modules/@intutable-org/*"),
        joinPath(__dirname, ".."),
    ])
}
main()
