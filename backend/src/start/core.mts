import path from "path"
import process from "process"

import { Core } from "@intutable/core"
import cors from "cors"

import { getFrontendUrl } from "../runtimeconfig.mjs"

const PLUGIN_PATHS =
  ["database","http"].map(
    (plugin) => path.join(process.cwd(), "node_modules/@intutable", plugin))


main()

/**
 * Start a {@link Core}. Since we have the HTTP plugin installed, it will keep
 * running and listen for requests.
 */
async function main(){
  const core : Core = await Core.create(PLUGIN_PATHS)
    .catch(e => crash<Core>(e))
  await core.events.request({ channel: "http", method: "addMiddleware",
                              handler: cors({
                                origin : getFrontendUrl()
                              }) }).catch(crash)
}

// The type system apparently knows that process.exit has bottom type!
function crash<A>(e : Error) : A {
  console.log(e)
  return process.exit(1)
}
